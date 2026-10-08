import {
  providerRepository,
  serviceRepository,
  bookingRepository,
  reviewRepository,
  availabilityRepository,
  userRepository,
} from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate } from '../utils/http.js';
import { lastMonthKeys, nowIso, todayLocal } from '../utils/time.js';
import { getDaySchedule } from '../utils/scheduling.js';
import { toPrivateProvider, toPublicProvider, toPublicReview, toPublicService } from '../utils/serializers.js';
import { BOOKING_STATUS, VERIFICATION_STATUS } from '../constants/index.js';
import { listCategories } from './category.service.js';
import { buildProviderAreaFields, findActiveAreasByPostalCode, getArea, resolveActiveAreas } from './area.service.js';
import { getPublicSchedule } from './availability.service.js';

/** BR-1: only verified providers with active accounts are publicly visible. */
export const isPubliclyVisible = (provider) =>
  Boolean(provider) && provider.verificationStatus === VERIFICATION_STATUS.VERIFIED && provider.accountActive !== false;

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

async function loadCandidateProviders({ areaId, postalCode, categoryId }) {
  if (areaId) return providerRepository.findVerifiedByArea(areaId);
  if (postalCode) return providerRepository.findVerifiedByPostalCode(postalCode);
  if (categoryId) return providerRepository.findVerifiedByCategory(categoryId);
  return providerRepository.findVerified(300);
}

async function loadActiveServicesFor(providers, categoryId) {
  if (categoryId) {
    const services = await serviceRepository.findActiveByCategory(categoryId);
    const ids = new Set(providers.map((p) => p.id));
    return services.filter((s) => ids.has(s.providerId));
  }
  const lists = await Promise.all(providers.map((p) => serviceRepository.findByProvider(p.id, { activeOnly: true })));
  return lists.flat();
}

/**
 * Searches providers by category + area, or category + postal code.
 * Filters: minRating, maxPrice, availableOn (date), free-text q. Sort: rating | price | reviews.
 */
export async function searchProviders(params) {
  const { categoryId, areaId, postalCode, minRating, maxPrice, availableOn, q, sort = 'rating', page, limit = 12 } = params;

  // BR-4: inactive categories behave as if they do not exist.
  const activeCategories = await listCategories();
  const activeCategoryIds = new Set(activeCategories.map((c) => c.id));
  const categoryNames = Object.fromEntries(activeCategories.map((c) => [c.id, c.name]));
  if (categoryId && !activeCategoryIds.has(categoryId)) {
    return { items: [], meta: { page: 1, limit, total: 0, totalPages: 1 }, context: { message: 'This category is not available.' } };
  }

  const context = {};
  if (areaId) context.area = await getArea(areaId).catch(() => null);
  if (postalCode) context.areasForPostalCode = await findActiveAreasByPostalCode(postalCode);

  let providers = (await loadCandidateProviders({ areaId, postalCode, categoryId })).filter(isPubliclyVisible);
  if (categoryId) providers = providers.filter((p) => (p.categoryIds || []).includes(categoryId));

  const services = (await loadActiveServicesFor(providers, categoryId)).filter((s) => activeCategoryIds.has(s.categoryId));
  const servicesByProvider = services.reduce((acc, s) => {
    (acc[s.providerId] ||= []).push(s);
    return acc;
  }, {});

  let availabilityById = {};
  if (availableOn) {
    const docs = await availabilityRepository.findByIds(providers.map((p) => p.id));
    availabilityById = Object.fromEntries(docs.map((d) => [d.id, d]));
  }

  const needle = q?.toLowerCase();
  let results = providers
    .map((provider) => {
      const offered = (servicesByProvider[provider.id] || []).sort((a, b) => a.price - b.price);
      if (!offered.length) return null; // providers without a bookable service are not shown
      return {
        provider: toPublicProvider(provider),
        startingPrice: offered[0].price,
        pricingType: offered[0].pricingType,
        primaryService: { id: offered[0].id, title: offered[0].title, categoryId: offered[0].categoryId },
        services: offered.slice(0, 3).map((s) => ({ id: s.id, title: s.title, price: s.price, pricingType: s.pricingType })),
        categoryNames: [...new Set(offered.map((s) => categoryNames[s.categoryId]).filter(Boolean))],
        serviceCount: offered.length,
      };
    })
    .filter(Boolean)
    .filter((r) => (minRating ? r.provider.ratingAverage >= minRating : true))
    .filter((r) => (maxPrice !== undefined ? r.startingPrice <= maxPrice : true))
    .filter((r) => {
      if (!needle) return true;
      return (
        r.provider.displayName.toLowerCase().includes(needle) ||
        r.provider.businessName.toLowerCase().includes(needle) ||
        r.services.some((s) => s.title.toLowerCase().includes(needle))
      );
    })
    .filter((r) => {
      if (!availableOn) return true;
      if (availableOn < todayLocal()) return false;
      return getDaySchedule(availabilityById[r.provider.id], availableOn).enabled;
    });

  const sorters = {
    rating: (a, b) => b.provider.ratingAverage - a.provider.ratingAverage || b.provider.ratingCount - a.provider.ratingCount,
    reviews: (a, b) => b.provider.ratingCount - a.provider.ratingCount,
    price_asc: (a, b) => a.startingPrice - b.startingPrice,
    price_desc: (a, b) => b.startingPrice - a.startingPrice,
  };
  results = results.sort(sorters[sort] || sorters.rating);

  const { items, meta } = paginate(results, { page, limit });
  return { items, meta, context };
}

/** Featured providers for the home page: top-rated verified providers. */
export async function getFeaturedProviders(limit = 6) {
  const providers = (await providerRepository.findVerified(100))
    .filter(isPubliclyVisible)
    .filter((p) => (p.activeServiceCount || 0) > 0)
    .sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0) || (b.ratingCount || 0) - (a.ratingCount || 0));
  return providers.slice(0, limit).map(toPublicProvider);
}

/* ------------------------------------------------------------------ */
/* Public profile                                                      */
/* ------------------------------------------------------------------ */

export async function getPublicProfile(providerId, viewer) {
  const provider = await providerRepository.findById(providerId);
  const isOwnerOrAdmin = viewer && (viewer.uid === providerId || viewer.role === 'admin');
  if (!provider || (!isPubliclyVisible(provider) && !isOwnerOrAdmin)) throw ApiError.notFound('Provider not found');

  const [services, reviews, schedule, categories] = await Promise.all([
    serviceRepository.findByProvider(providerId, { activeOnly: true }),
    reviewRepository.findPublishedByProvider(providerId),
    getPublicSchedule(providerId),
    listCategories(),
  ]);
  const categoryNames = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return {
    provider: toPublicProvider(provider),
    services: services
      .filter((s) => categoryNames[s.categoryId])
      .sort((a, b) => a.price - b.price)
      .map(toPublicService),
    categories: (provider.categoryIds || []).filter((id) => categoryNames[id]).map((id) => ({ id, name: categoryNames[id] })),
    reviews: reviews.slice(0, 20).map(toPublicReview),
    availability: schedule,
  };
}

export async function getProviderReviews(providerId, { page, limit } = {}) {
  const provider = await providerRepository.findById(providerId);
  if (!provider) throw ApiError.notFound('Provider not found');
  const reviews = await reviewRepository.findPublishedByProvider(providerId);
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: reviews.filter((r) => r.rating === stars).length }));
  const { items, meta } = paginate(reviews.map(toPublicReview), { page, limit });
  return {
    items,
    meta,
    summary: { ratingAverage: provider.ratingAverage || 0, ratingCount: provider.ratingCount || 0, distribution },
  };
}

/* ------------------------------------------------------------------ */
/* Own profile                                                          */
/* ------------------------------------------------------------------ */

export async function getOwnProfile(providerId) {
  const provider = await providerRepository.findById(providerId);
  if (!provider) throw ApiError.notFound('Provider profile not found');
  return toPrivateProvider(provider);
}

export async function updateOwnProfile(providerId, changes) {
  const provider = await providerRepository.findById(providerId);
  if (!provider) throw ApiError.notFound('Provider profile not found');

  const update = { ...changes, updatedAt: nowIso() };

  if (changes.areaIds) Object.assign(update, buildProviderAreaFields(await resolveActiveAreas(changes.areaIds)));

  if (changes.categoryIds) {
    const active = new Set((await listCategories()).map((c) => c.id));
    if (changes.categoryIds.some((id) => !active.has(id))) throw ApiError.badRequest('One or more categories are invalid or inactive');
    update.categoryIds = [...new Set(changes.categoryIds)];
  }

  // Re-submitting documents after a rejection puts the provider back in the review queue.
  if (changes.verificationDocuments && provider.verificationStatus === VERIFICATION_STATUS.REJECTED) {
    update.verificationStatus = VERIFICATION_STATUS.PENDING;
    update.verificationNote = '';
  }

  const updated = await providerRepository.update(providerId, update);

  // Keep the shared user profile in sync for fields both records carry.
  const userSync = {};
  if (changes.displayName) userSync.displayName = changes.displayName;
  if (changes.phone !== undefined) userSync.phone = changes.phone;
  if (changes.photoURL !== undefined) userSync.photoURL = changes.photoURL;
  if (Object.keys(userSync).length) await userRepository.update(providerId, { ...userSync, updatedAt: nowIso() });

  return toPrivateProvider(updated);
}

/* ------------------------------------------------------------------ */
/* Dashboard & earnings                                                */
/* ------------------------------------------------------------------ */

const bookingAmount = (b) => Number(b.price) || 0;

export async function getDashboard(providerId) {
  const [provider, bookings, services] = await Promise.all([
    providerRepository.findById(providerId),
    bookingRepository.findByProvider(providerId),
    serviceRepository.findByProvider(providerId),
  ]);
  if (!provider) throw ApiError.notFound('Provider profile not found');

  const today = todayLocal();
  const byStatus = (status) => bookings.filter((b) => b.status === status);
  const completed = byStatus(BOOKING_STATUS.COMPLETED);
  const months = lastMonthKeys(6);

  const upcoming = bookings
    .filter((b) => [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS].includes(b.status) && b.bookingDate >= today)
    .sort((a, b) => `${a.bookingDate}${a.startTime}`.localeCompare(`${b.bookingDate}${b.startTime}`));

  const popularity = Object.values(
    bookings.reduce((acc, b) => {
      acc[b.serviceId] ||= { serviceId: b.serviceId, title: b.serviceTitle, count: 0 };
      acc[b.serviceId].count += 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    verificationStatus: provider.verificationStatus,
    verificationNote: provider.verificationNote || '',
    stats: {
      pending: byStatus(BOOKING_STATUS.PENDING).length,
      confirmed: byStatus(BOOKING_STATUS.CONFIRMED).length,
      inProgress: byStatus(BOOKING_STATUS.IN_PROGRESS).length,
      completed: completed.length,
      cancelled: byStatus(BOOKING_STATUS.CANCELLED).length,
      totalEarnings: completed.reduce((sum, b) => sum + bookingAmount(b), 0),
      ratingAverage: provider.ratingAverage || 0,
      ratingCount: provider.ratingCount || 0,
      activeServices: services.filter((s) => s.active).length,
      upcoming: upcoming.length,
    },
    upcomingBookings: upcoming.slice(0, 5),
    monthly: months.map((month) => {
      const inMonth = bookings.filter((b) => b.bookingDate.startsWith(month));
      return {
        month,
        bookings: inMonth.length,
        earnings: inMonth.filter((b) => b.status === BOOKING_STATUS.COMPLETED).reduce((s, b) => s + bookingAmount(b), 0),
      };
    }),
    servicePopularity: popularity,
  };
}

export async function getEarnings(providerId, { page, limit } = {}) {
  const bookings = await bookingRepository.findByProvider(providerId);
  const completed = bookings
    .filter((b) => b.status === BOOKING_STATUS.COMPLETED)
    .sort((a, b) => (b.completedAt || b.bookingDate).localeCompare(a.completedAt || a.bookingDate));
  const thisMonth = todayLocal().slice(0, 7);
  const sum = (list) => list.reduce((s, b) => s + bookingAmount(b), 0);
  const { items, meta } = paginate(
    completed.map((b) => ({
      id: b.id,
      bookingDate: b.bookingDate,
      serviceTitle: b.serviceTitle,
      customerName: b.customerName,
      amount: bookingAmount(b),
      paymentStatus: b.paymentStatus,
      completedAt: b.completedAt,
    })),
    { page, limit },
  );
  return {
    summary: {
      totalEarnings: sum(completed),
      thisMonth: sum(completed.filter((b) => b.bookingDate.startsWith(thisMonth))),
      completedJobs: completed.length,
      averagePerJob: completed.length ? Math.round(sum(completed) / completed.length) : 0,
      collected: sum(completed.filter((b) => ['paid', 'cash'].includes(b.paymentStatus))),
      outstanding: sum(completed.filter((b) => b.paymentStatus === 'unpaid')),
    },
    monthly: lastMonthKeys(12).map((month) => ({ month, earnings: sum(completed.filter((b) => b.bookingDate.startsWith(month))) })),
    items,
    meta,
  };
}
