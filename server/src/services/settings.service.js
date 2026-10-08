import { settingsRepository } from '../repositories/index.js';
import { DEFAULT_SETTINGS } from '../constants/index.js';
import { nowIso } from '../utils/time.js';

/*
 * Platform settings live in a single Firestore document: settings/platform.
 * Every business rule that admins can tune (e.g. bookingCancellationCutoffMinutes)
 * is read through getSettings() so it is defined in exactly one place.
 */

const SETTINGS_DOC_ID = 'platform';
const CACHE_TTL_MS = 30_000;
let cache = null;

export async function getSettings() {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  const stored = await settingsRepository.findById(SETTINGS_DOC_ID);
  const { id: _id, ...rest } = stored || {};
  const value = { ...DEFAULT_SETTINGS, ...rest };
  cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}

export async function updateSettings(changes, adminUid) {
  await settingsRepository.upsert(SETTINGS_DOC_ID, { ...changes, updatedAt: nowIso(), updatedBy: adminUid });
  clearSettingsCache();
  return getSettings();
}

/** Subset safe to expose to unauthenticated clients. */
export async function getPublicSettings() {
  const s = await getSettings();
  return {
    platformName: s.platformName,
    supportEmail: s.supportEmail,
    supportPhone: s.supportPhone,
    bookingCancellationCutoffMinutes: s.bookingCancellationCutoffMinutes,
    lateCancellationPolicy: s.lateCancellationPolicy,
    lateCancellationFeePercent: s.lateCancellationFeePercent,
    maxAdvanceBookingDays: s.maxAdvanceBookingDays,
  };
}

export function clearSettingsCache() {
  cache = null;
}
