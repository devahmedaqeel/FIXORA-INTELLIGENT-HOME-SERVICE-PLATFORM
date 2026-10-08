import { bookingRepository, providerRepository, userRepository, categoryRepository } from '../repositories/index.js';
import { lastMonthKeys, monthKey } from '../utils/time.js';
import { BOOKING_STATUS, ROLES, VERIFICATION_STATUS } from '../constants/index.js';

/*
 * Admin reporting. Bookings are fetched once for the requested window (indexed on
 * createdAt) and aggregated in memory, which keeps reads to one query per report.
 */

const monthStartIso = (key) => `${key}-01T00:00:00.000Z`;

async function bookingsInWindow(months) {
  const keys = lastMonthKeys(months);
  const bookings = await bookingRepository.findWhere([['createdAt', '>=', monthStartIso(keys[0])]]);
  return { keys, bookings };
}

const amount = (b) => Number(b.price) || 0;

export async function getBookingReport({ months = 6 } = {}) {
  const { keys, bookings } = await bookingsInWindow(months);
  const monthly = keys.map((key) => {
    const inMonth = bookings.filter((b) => monthKey(b.createdAt) === key);
    const completed = inMonth.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
    return {
      month: key,
      total: inMonth.length,
      completed: completed.length,
      cancelled: inMonth.filter((b) => b.status === BOOKING_STATUS.CANCELLED).length,
      rejected: inMonth.filter((b) => b.status === BOOKING_STATUS.REJECTED).length,
      revenue: completed.reduce((s, b) => s + amount(b), 0),
    };
  });
  const byStatus = Object.values(BOOKING_STATUS).map((status) => ({ status, count: bookings.filter((b) => b.status === status).length }));
  const totals = monthly.reduce(
    (acc, m) => ({
      total: acc.total + m.total,
      completed: acc.completed + m.completed,
      cancelled: acc.cancelled + m.cancelled,
      revenue: acc.revenue + m.revenue,
    }),
    { total: 0, completed: 0, cancelled: 0, revenue: 0 },
  );
  return {
    months,
    totals: { ...totals, completionRate: totals.total ? Math.round((totals.completed / totals.total) * 100) : 0 },
    monthly,
    byStatus,
  };
}

export async function getCategoryReport({ months = 6 } = {}) {
  const [{ bookings }, categories] = await Promise.all([bookingsInWindow(months), categoryRepository.findAll()]);
  const rows = categories.map((c) => {
    const inCategory = bookings.filter((b) => b.categoryId === c.id);
    return {
      categoryId: c.id,
      name: c.name,
      active: c.active,
      bookings: inCategory.length,
      completed: inCategory.filter((b) => b.status === BOOKING_STATUS.COMPLETED).length,
      revenue: inCategory.filter((b) => b.status === BOOKING_STATUS.COMPLETED).reduce((s, b) => s + amount(b), 0),
    };
  });
  return { months, categories: rows.sort((a, b) => b.bookings - a.bookings) };
}

export async function getProviderReport({ months = 6 } = {}) {
  const [{ bookings }, providers] = await Promise.all([
    bookingsInWindow(months),
    providerRepository.findByStatus(VERIFICATION_STATUS.VERIFIED),
  ]);
  const performance = providers.map((p) => {
    const own = bookings.filter((b) => b.providerId === p.id);
    const completed = own.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
    const decided = own.filter((b) => b.status !== BOOKING_STATUS.PENDING);
    return {
      providerId: p.id,
      displayName: p.businessName || p.displayName,
      cities: p.cities || [],
      bookings: own.length,
      completed: completed.length,
      cancelled: own.filter((b) => b.status === BOOKING_STATUS.CANCELLED).length,
      rejected: own.filter((b) => b.status === BOOKING_STATUS.REJECTED).length,
      completionRate: decided.length ? Math.round((completed.length / decided.length) * 100) : 0,
      earnings: completed.reduce((s, b) => s + amount(b), 0),
      ratingAverage: p.ratingAverage || 0,
      ratingCount: p.ratingCount || 0,
    };
  });
  const topProviders = [...performance]
    .sort((a, b) => b.completed - a.completed || b.ratingAverage - a.ratingAverage)
    .slice(0, 10);
  const rated = providers.filter((p) => p.ratingCount > 0);
  const platformAverageRating = rated.length
    ? Math.round((rated.reduce((s, p) => s + (p.ratingTotal || 0), 0) / rated.reduce((s, p) => s + p.ratingCount, 0)) * 100) / 100
    : 0;
  return { months, topProviders, performance: performance.sort((a, b) => b.bookings - a.bookings), platformAverageRating };
}

export async function getUserGrowthReport({ months = 6 } = {}) {
  const keys = lastMonthKeys(months);
  const users = await userRepository.findWhere([['createdAt', '>=', monthStartIso(keys[0])]]);
  const monthly = keys.map((key) => {
    const inMonth = users.filter((u) => monthKey(u.createdAt) === key);
    return {
      month: key,
      customers: inMonth.filter((u) => u.role === ROLES.CUSTOMER).length,
      providers: inMonth.filter((u) => u.role === ROLES.PROVIDER).length,
      total: inMonth.length,
    };
  });
  return {
    months,
    monthly,
    newCustomers: monthly.reduce((s, m) => s + m.customers, 0),
    newProviders: monthly.reduce((s, m) => s + m.providers, 0),
  };
}

/** Everything the Reports page needs in one call. */
export async function getSummaryReport(params) {
  const [bookings, categories, providers, users] = await Promise.all([
    getBookingReport(params),
    getCategoryReport(params),
    getProviderReport(params),
    getUserGrowthReport(params),
  ]);
  return { bookings, categories, providers, users, generatedAt: new Date().toISOString() };
}
