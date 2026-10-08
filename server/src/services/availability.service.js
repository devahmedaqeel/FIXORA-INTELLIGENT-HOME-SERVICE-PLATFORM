import { availabilityRepository, bookingRepository, providerRepository, serviceRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { diffDays, nowIso, nowLocalMinutes, todayLocal } from '../utils/time.js';
import { generateSlots } from '../utils/scheduling.js';
import { getSettings } from './settings.service.js';
import { VERIFICATION_STATUS, WEEKDAYS } from '../constants/index.js';

/** New providers start with Mon–Sat 09:00–17:00; Sunday off. They can change it any time. */
export function buildDefaultAvailability(providerId) {
  const weekly = Object.fromEntries(
    WEEKDAYS.map((day) => [day, { enabled: day !== 'sunday', start: '09:00', end: '17:00' }]),
  );
  return { providerId, weekly, exceptions: [], slotIntervalMinutes: 30, bufferMinutes: 0, updatedAt: nowIso() };
}

export async function getAvailability(providerId) {
  const stored = await availabilityRepository.findById(providerId);
  return stored || { id: providerId, ...buildDefaultAvailability(providerId) };
}

export async function updateAvailability(providerId, { weekly, exceptions = [], slotIntervalMinutes, bufferMinutes }) {
  const today = todayLocal();
  // Keep only future exceptions, de-duplicated by date and sorted.
  const uniqueExceptions = [...new Map(exceptions.filter((e) => e.date >= today).map((e) => [e.date, e])).values()].sort(
    (a, b) => a.date.localeCompare(b.date),
  );
  const current = await getAvailability(providerId);
  return availabilityRepository.upsert(providerId, {
    providerId,
    weekly,
    exceptions: uniqueExceptions,
    slotIntervalMinutes: slotIntervalMinutes ?? current.slotIntervalMinutes ?? 30,
    bufferMinutes: bufferMinutes ?? current.bufferMinutes ?? 0,
    updatedAt: nowIso(),
  });
}

/** Public: bookable slots for a provider on a date (optionally for a specific service). */
export async function getAvailableSlots(providerId, { date, serviceId }) {
  const provider = await providerRepository.findById(providerId);
  if (!provider || provider.verificationStatus !== VERIFICATION_STATUS.VERIFIED || provider.accountActive === false) {
    throw ApiError.notFound('Provider not found');
  }

  let duration = 60;
  if (serviceId) {
    const service = await serviceRepository.findById(serviceId);
    if (!service || service.providerId !== providerId || !service.active) throw ApiError.notFound('Service not found');
    duration = service.duration;
  }

  const settings = await getSettings();
  const today = todayLocal();
  if (diffDays(today, date) > settings.maxAdvanceBookingDays) {
    return { date, duration, available: false, reason: `Bookings open ${settings.maxAdvanceBookingDays} days in advance`, slots: [] };
  }

  const [availability, existingBookings] = await Promise.all([
    getAvailability(providerId),
    bookingRepository.findProviderDay(providerId, date),
  ]);

  const result = generateSlots({
    availability,
    date,
    duration,
    existingBookings,
    today,
    nowMinutes: nowLocalMinutes(),
    intervalMinutes: availability.slotIntervalMinutes || settings.slotIntervalMinutes,
    bufferMinutes: availability.bufferMinutes || 0,
  });
  return { date, duration, ...result };
}

/** Weekly schedule + upcoming exceptions, safe for public display. */
export async function getPublicSchedule(providerId) {
  const availability = await getAvailability(providerId);
  const today = todayLocal();
  return {
    weekly: availability.weekly,
    exceptions: (availability.exceptions || []).filter((e) => e.date >= today).map(({ date }) => ({ date })),
    slotIntervalMinutes: availability.slotIntervalMinutes,
  };
}
