import { serviceRepository, providerRepository, bookingRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { nowIso } from '../utils/time.js';
import { getActiveCategory } from './category.service.js';

/*
 * A "service offering" is one priced service a provider sells (e.g. "Kitchen tap repair").
 * Named this way to avoid confusion with the service layer itself.
 */

/** Recomputes the denormalised provider fields that search relies on. */
export async function refreshProviderServiceStats(providerId) {
  const services = await serviceRepository.findByProvider(providerId);
  const active = services.filter((s) => s.active);
  const provider = await providerRepository.findById(providerId);
  if (!provider) return;
  const categoryIds = [...new Set([...(provider.categoryIds || []), ...active.map((s) => s.categoryId)])];
  await providerRepository.update(providerId, {
    activeServiceCount: active.length,
    minPrice: active.length ? Math.min(...active.map((s) => s.price)) : null,
    categoryIds,
    updatedAt: nowIso(),
  });
}

export async function getOwnedService(providerId, serviceId) {
  const service = await serviceRepository.findById(serviceId);
  if (!service || service.providerId !== providerId) throw ApiError.notFound('Service not found');
  return service;
}

export async function listProviderServices(providerId, { activeOnly = false } = {}) {
  const services = await serviceRepository.findByProvider(providerId, { activeOnly });
  return services.filter((s) => !s.archived).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function getService(serviceId) {
  const service = await serviceRepository.findById(serviceId);
  if (!service) throw ApiError.notFound('Service not found');
  return service;
}

export async function createService(providerId, data) {
  const category = await getActiveCategory(data.categoryId);
  if (!category) throw ApiError.badRequest('Select an active service category');

  const timestamp = nowIso();
  const service = await serviceRepository.create({
    ...data,
    providerId,
    categoryName: category.name,
    imageURL: data.imageURL || '',
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await refreshProviderServiceStats(providerId);
  return service;
}

export async function updateService(providerId, serviceId, changes) {
  await getOwnedService(providerId, serviceId);
  const update = { ...changes, updatedAt: nowIso() };
  if (changes.active === true) update.archived = false;
  if (changes.categoryId) {
    const category = await getActiveCategory(changes.categoryId);
    if (!category) throw ApiError.badRequest('Select an active service category');
    update.categoryName = category.name;
  }
  const updated = await serviceRepository.update(serviceId, update);
  await refreshProviderServiceStats(providerId);
  return updated;
}

/**
 * Services that already have bookings are deactivated rather than deleted so booking
 * history keeps a valid reference.
 */
export async function deleteService(providerId, serviceId) {
  await getOwnedService(providerId, serviceId);
  const bookingCount = await bookingRepository.count([['serviceId', '==', serviceId]]);
  if (bookingCount > 0) {
    await serviceRepository.update(serviceId, { active: false, archived: true, updatedAt: nowIso() });
    await refreshProviderServiceStats(providerId);
    return { id: serviceId, archived: true };
  }
  await serviceRepository.delete(serviceId);
  await refreshProviderServiceStats(providerId);
  return { id: serviceId, deleted: true };
}

/** Public read of one service; hidden unless active and its provider is publicly visible. */
export async function getPublicServiceDetail(serviceId) {
  const service = await serviceRepository.findById(serviceId);
  if (!service || !service.active) throw ApiError.notFound('Service not found');
  const provider = await providerRepository.findById(service.providerId);
  if (!provider || provider.verificationStatus !== 'verified' || provider.accountActive === false) {
    throw ApiError.notFound('Service not found');
  }
  return { service, providerName: provider.businessName || provider.displayName };
}
