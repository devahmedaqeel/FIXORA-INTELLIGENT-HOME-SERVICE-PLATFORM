import { areaRepository, providerRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { nowIso } from '../utils/time.js';
import { paginate } from '../utils/http.js';
import { DEFAULT_COUNTRY } from '../constants/index.js';

/*
 * Location discovery is fully database-driven (no maps / geocoding APIs):
 * Area + City + District + Province + Postal code, stored in the `areas` collection.
 * The active list is small (hundreds of rows), so it is cached briefly and filtered in memory,
 * which gives prefix/substring matching that Firestore cannot do natively.
 */

const CACHE_TTL_MS = 5 * 60 * 1000;
let activeCache = null;

const normalize = (value = '') => value.toString().toLowerCase().trim();

async function getActiveAreas() {
  if (activeCache && activeCache.expiresAt > Date.now()) return activeCache.items;
  const items = await areaRepository.findAll({ activeOnly: true });
  activeCache = { items, expiresAt: Date.now() + CACHE_TTL_MS };
  return items;
}

export function clearAreaCache() {
  activeCache = null;
}

const matches = (area, { q, postalCode, city, province }) => {
  if (postalCode && !area.postalCode.startsWith(postalCode)) return false;
  if (city && normalize(area.city) !== normalize(city)) return false;
  if (province && normalize(area.province) !== normalize(province)) return false;
  if (q) {
    const needle = normalize(q);
    const haystack = [area.areaName, area.city, area.district, area.postalCode].map(normalize);
    if (!haystack.some((h) => h.includes(needle))) return false;
  }
  return true;
};

const sortAreas = (a, b) => a.city.localeCompare(b.city) || a.areaName.localeCompare(b.areaName);

export async function searchAreas({ includeInactive = false, page, limit = 50, ...filters } = {}) {
  const source = includeInactive ? await areaRepository.findAll() : await getActiveAreas();
  return paginate(source.filter((area) => matches(area, filters)).sort(sortAreas), { page, limit });
}

/** Distinct cities/provinces for filter dropdowns. */
export async function getAreaFacets() {
  const areas = await getActiveAreas();
  const cities = [...new Set(areas.map((a) => a.city))].sort();
  const provinces = [...new Set(areas.map((a) => a.province))].sort();
  return { cities, provinces, total: areas.length };
}

export async function getArea(id) {
  const area = await areaRepository.findById(id);
  if (!area) throw ApiError.notFound('Area not found');
  return area;
}

export async function findActiveAreasByPostalCode(postalCode) {
  return areaRepository.findByPostalCode(postalCode);
}

/** Validates a list of area IDs and returns the active area documents. */
export async function resolveActiveAreas(areaIds = []) {
  const areas = await areaRepository.findByIds(areaIds);
  const active = areas.filter((a) => a.active);
  if (active.length !== new Set(areaIds).size) {
    throw ApiError.badRequest('One or more selected service areas are invalid or inactive');
  }
  return active;
}

/** Denormalised fields kept on a provider so search can use single array-contains queries. */
export const buildProviderAreaFields = (areas) => ({
  areaIds: areas.map((a) => a.id),
  postalCodes: [...new Set(areas.map((a) => a.postalCode))],
  cities: [...new Set(areas.map((a) => a.city))],
  serviceAreas: areas.map((a) => ({ id: a.id, areaName: a.areaName, city: a.city, postalCode: a.postalCode })),
});

async function assertNoDuplicate({ areaName, city, postalCode }, exceptId) {
  const sameCode = await areaRepository.findWhere([['postalCode', '==', postalCode]]);
  const duplicate = sameCode.find(
    (a) => a.id !== exceptId && normalize(a.areaName) === normalize(areaName) && normalize(a.city) === normalize(city),
  );
  if (duplicate) throw ApiError.conflict('This area already exists for that city and postal code');
}

export async function createArea(data) {
  await assertNoDuplicate(data);
  const timestamp = nowIso();
  const area = await areaRepository.create({ ...data, country: DEFAULT_COUNTRY, createdAt: timestamp, updatedAt: timestamp });
  clearAreaCache();
  return area;
}

/** Keeps denormalised provider fields in sync when an area's name/code/city changes. */
async function resyncProvidersForArea(areaId) {
  const providers = await providerRepository.findWhere([['areaIds', 'array-contains', areaId]]);
  await Promise.all(
    providers.map(async (provider) => {
      const areas = await areaRepository.findByIds(provider.areaIds);
      await providerRepository.update(provider.id, { ...buildProviderAreaFields(areas), updatedAt: nowIso() });
    }),
  );
}

export async function updateArea(id, changes) {
  const current = await getArea(id);
  const merged = { ...current, ...changes };
  if (changes.areaName || changes.city || changes.postalCode) await assertNoDuplicate(merged, id);
  const updated = await areaRepository.update(id, { ...changes, updatedAt: nowIso() });
  clearAreaCache();
  if (changes.areaName || changes.city || changes.postalCode) await resyncProvidersForArea(id);
  return updated;
}

export async function deleteArea(id) {
  await getArea(id);
  const inUse = await providerRepository.count([['areaIds', 'array-contains', id]]);
  if (inUse > 0) {
    throw ApiError.conflict(`${inUse} provider(s) serve this area. Deactivate it instead of deleting it.`);
  }
  await areaRepository.delete(id);
  clearAreaCache();
  return { id };
}
