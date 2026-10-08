import { randomUUID } from 'node:crypto';
import { bookingRepository, customerRepository, providerRepository, reviewRepository, userRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { nowIso, todayLocal } from '../utils/time.js';
import { toPublicProvider, toPublicReview } from '../utils/serializers.js';
import { BOOKING_STATUS, MAX_SAVED_ADDRESSES } from '../constants/index.js';
import { isPubliclyVisible } from './provider.service.js';

async function getCustomerRecord(uid) {
  const record = await customerRepository.findById(uid);
  if (record) return record;
  // Self-heal for accounts created before the customers collection existed.
  const timestamp = nowIso();
  return customerRepository.create({ userId: uid, savedProviderIds: [], createdAt: timestamp, updatedAt: timestamp }, uid);
}

export async function getDashboard(uid) {
  const [bookings, customer, reviews, user] = await Promise.all([
    bookingRepository.findByCustomer(uid),
    getCustomerRecord(uid),
    reviewRepository.findByCustomer(uid),
    userRepository.findById(uid),
  ]);
  const today = todayLocal();
  const chrono = (a, b) => `${a.bookingDate}${a.startTime}`.localeCompare(`${b.bookingDate}${b.startTime}`);

  const upcoming = bookings
    .filter((b) => [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(b.status) && b.bookingDate >= today)
    .sort(chrono);
  const active = bookings.filter((b) => b.status === BOOKING_STATUS.IN_PROGRESS);
  const completed = bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
  const cancelled = bookings.filter((b) => [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED].includes(b.status));

  const savedProviders = (await providerRepository.findByIds(customer.savedProviderIds || [])).filter(isPubliclyVisible);

  // Recommendations: top-rated verified providers in the customer's default area (or overall).
  const savedIds = new Set(customer.savedProviderIds || []);
  const pool = user?.defaultAreaId
    ? await providerRepository.findVerifiedByArea(user.defaultAreaId)
    : await providerRepository.findVerified(60);
  const recommended = pool
    .filter((p) => isPubliclyVisible(p) && !savedIds.has(p.id) && (p.activeServiceCount || 0) > 0)
    .sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0))
    .slice(0, 4);

  const recentActivity = [...bookings]
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 6)
    .map((b) => ({ bookingId: b.id, serviceTitle: b.serviceTitle, providerName: b.providerName, status: b.status, updatedAt: b.updatedAt }));

  return {
    stats: {
      upcoming: upcoming.length,
      active: active.length,
      completed: completed.length,
      cancelled: cancelled.length,
      awaitingReview: completed.filter((b) => !b.reviewed).length,
    },
    upcomingBookings: upcoming.slice(0, 5),
    recentBookings: [...bookings].sort((a, b) => chrono(b, a)).slice(0, 5),
    savedProviders: savedProviders.slice(0, 4).map(toPublicProvider),
    recommendedProviders: recommended.map(toPublicProvider),
    recentReviews: reviews.slice(0, 3).map(toPublicReview),
    recentActivity,
  };
}

export async function listSavedProviders(uid) {
  const customer = await getCustomerRecord(uid);
  const providers = await providerRepository.findByIds(customer.savedProviderIds || []);
  return providers.filter(isPubliclyVisible).map(toPublicProvider);
}

export async function saveProvider(uid, providerId) {
  const provider = await providerRepository.findById(providerId);
  if (!isPubliclyVisible(provider)) throw ApiError.notFound('Provider not found');
  const customer = await getCustomerRecord(uid);
  const saved = new Set(customer.savedProviderIds || []);
  if (saved.size >= 100) throw ApiError.badRequest('You can save up to 100 providers');
  saved.add(providerId);
  await customerRepository.update(uid, { savedProviderIds: [...saved], updatedAt: nowIso() });
  return { savedProviderIds: [...saved] };
}

export async function unsaveProvider(uid, providerId) {
  const customer = await getCustomerRecord(uid);
  const saved = (customer.savedProviderIds || []).filter((id) => id !== providerId);
  await customerRepository.update(uid, { savedProviderIds: saved, updatedAt: nowIso() });
  return { savedProviderIds: saved };
}

export async function getSavedProviderIds(uid) {
  return (await getCustomerRecord(uid)).savedProviderIds || [];
}

/* ------------------------------------------------------------------ */
/* Saved addresses                                                     */
/* ------------------------------------------------------------------ */

const withSingleDefault = (addresses, defaultId) => addresses.map((a) => ({ ...a, isDefault: a.id === defaultId }));

export async function listAddresses(uid) {
  return (await getCustomerRecord(uid)).addresses || [];
}

export async function addAddress(uid, input) {
  const customer = await getCustomerRecord(uid);
  const addresses = customer.addresses || [];
  if (addresses.length >= MAX_SAVED_ADDRESSES) throw ApiError.badRequest(`You can save up to ${MAX_SAVED_ADDRESSES} addresses`);

  const created = { ...input, id: randomUUID(), isDefault: false };
  let updated = [...addresses, created];
  if (input.isDefault || addresses.length === 0) updated = withSingleDefault(updated, created.id);

  await customerRepository.update(uid, { addresses: updated, updatedAt: nowIso() });
  return updated.find((a) => a.id === created.id);
}

export async function updateAddress(uid, addressId, input) {
  const customer = await getCustomerRecord(uid);
  const addresses = customer.addresses || [];
  if (!addresses.some((a) => a.id === addressId)) throw ApiError.notFound('Address not found');

  let updated = addresses.map((a) => (a.id === addressId ? { ...a, ...input, id: addressId } : a));
  if (input.isDefault) updated = withSingleDefault(updated, addressId);

  await customerRepository.update(uid, { addresses: updated, updatedAt: nowIso() });
  return updated.find((a) => a.id === addressId);
}

export async function deleteAddress(uid, addressId) {
  const customer = await getCustomerRecord(uid);
  const addresses = customer.addresses || [];
  const target = addresses.find((a) => a.id === addressId);
  if (!target) throw ApiError.notFound('Address not found');

  let remaining = addresses.filter((a) => a.id !== addressId);
  if (target.isDefault && remaining.length > 0) remaining = withSingleDefault(remaining, remaining[0].id);

  await customerRepository.update(uid, { addresses: remaining, updatedAt: nowIso() });
  return remaining;
}
