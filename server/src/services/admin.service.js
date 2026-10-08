import { getAuth } from '../config/firebase.js';
import {
  userRepository,
  providerRepository,
  bookingRepository,
  reviewRepository,
  complaintRepository,
  chatbotQueryRepository,
  serviceRepository,
} from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate } from '../utils/http.js';
import { logger } from '../utils/logger.js';
import { nowIso } from '../utils/time.js';
import { toPrivateProvider, toUserProfile } from '../utils/serializers.js';
import {
  ACCOUNT_STATUS,
  BOOKING_STATUS,
  COMPLAINT_STATUS,
  NOTIFICATION_TYPES,
  ROLES,
  VERIFICATION_STATUS,
} from '../constants/index.js';
import * as notificationService from './notification/notification.service.js';
import { getAvailability } from './availability.service.js';

/* ---------- Dashboard ---------- */

export async function getDashboardStats() {
  const count = (repo, filters) => repo.count(filters);
  const [
    totalUsers,
    totalCustomers,
    totalProviders,
    verifiedProviders,
    pendingProviders,
    totalBookings,
    completedBookings,
    cancelledBookings,
    pendingBookings,
    totalReviews,
    openComplaints,
    totalComplaints,
    unansweredQueries,
  ] = await Promise.all([
    count(userRepository, [['status', 'in', [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.SUSPENDED]]]),
    count(userRepository, [['role', '==', ROLES.CUSTOMER]]),
    count(userRepository, [['role', '==', ROLES.PROVIDER]]),
    count(providerRepository, [['verificationStatus', '==', VERIFICATION_STATUS.VERIFIED]]),
    count(providerRepository, [['verificationStatus', '==', VERIFICATION_STATUS.PENDING]]),
    count(bookingRepository, []),
    count(bookingRepository, [['status', '==', BOOKING_STATUS.COMPLETED]]),
    count(bookingRepository, [['status', '==', BOOKING_STATUS.CANCELLED]]),
    count(bookingRepository, [['status', '==', BOOKING_STATUS.PENDING]]),
    count(reviewRepository, [['status', '==', 'published']]),
    count(complaintRepository, [['status', 'in', [COMPLAINT_STATUS.OPEN, COMPLAINT_STATUS.IN_REVIEW]]]),
    count(complaintRepository, []),
    count(chatbotQueryRepository, [['resolved', '==', false]]),
  ]);

  const recentBookings = await bookingRepository.findWhere([], { orderBy: ['createdAt', 'desc'], limit: 6 });
  const pendingQueue = (await providerRepository.findByStatus(VERIFICATION_STATUS.PENDING)).slice(0, 5).map(toPrivateProvider);

  return {
    stats: {
      totalUsers,
      totalCustomers,
      totalProviders,
      verifiedProviders,
      pendingProviders,
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      totalReviews,
      openComplaints,
      totalComplaints,
      unansweredQueries,
    },
    recentBookings,
    pendingProviders: pendingQueue,
  };
}

/* ---------- Users ---------- */

export async function listUsers({ role, status, q, page, limit } = {}) {
  let users = role ? await userRepository.findByRole(role) : await userRepository.findAll();
  if (status) users = users.filter((u) => u.status === status);
  if (q) {
    const needle = q.toLowerCase();
    users = users.filter((u) => `${u.displayName} ${u.email || ''} ${u.phone || ''}`.toLowerCase().includes(needle));
  }
  return paginate(users.map(toUserProfile), { page, limit });
}

export async function getUserDetail(uid) {
  const user = await userRepository.findById(uid);
  if (!user) throw ApiError.notFound('User not found');
  const bookings =
    user.role === ROLES.PROVIDER ? await bookingRepository.findByProvider(uid) : await bookingRepository.findByCustomer(uid);
  return {
    user: toUserProfile(user),
    provider: user.role === ROLES.PROVIDER ? toPrivateProvider(await providerRepository.findById(uid)) : null,
    bookingCount: bookings.length,
    recentBookings: bookings.slice(0, 10),
  };
}

export async function updateUserStatus(admin, uid, { status, reason = '' }) {
  if (admin.uid === uid) throw ApiError.badRequest('You cannot change your own account status');
  const user = await userRepository.findById(uid);
  if (!user || user.status === ACCOUNT_STATUS.DELETED) throw ApiError.notFound('User not found');

  const timestamp = nowIso();
  const updated = await userRepository.update(uid, { status, statusReason: reason, updatedAt: timestamp });
  if (user.role === ROLES.PROVIDER) {
    await providerRepository.update(uid, { accountActive: status === ACCOUNT_STATUS.ACTIVE, updatedAt: timestamp });
  }
  try {
    // Disabling in Firebase Auth also blocks token refresh on every device.
    await getAuth().updateUser(uid, { disabled: status === ACCOUNT_STATUS.SUSPENDED });
  } catch (error) {
    logger.warn(`Could not update Firebase Auth disabled flag for ${uid}: ${error.message}`);
  }
  return toUserProfile(updated);
}

/* ---------- Providers & verification (BR-8) ---------- */

export async function listProviders({ status, q, page, limit } = {}) {
  let providers = await providerRepository.findByStatus(status);
  if (q) {
    const needle = q.toLowerCase();
    providers = providers.filter((p) => `${p.displayName} ${p.businessName || ''} ${(p.cities || []).join(' ')}`.toLowerCase().includes(needle));
  }
  const users = await userRepository.findByIds(providers.map((p) => p.id));
  const emails = Object.fromEntries(users.map((u) => [u.id, { email: u.email, status: u.status }]));
  return paginate(
    providers.map((p) => ({ ...toPrivateProvider(p), email: emails[p.id]?.email || '', accountStatus: emails[p.id]?.status || '' })),
    { page, limit },
  );
}

export async function getProviderDetail(providerId) {
  const provider = await providerRepository.findById(providerId);
  if (!provider) throw ApiError.notFound('Provider not found');
  const [user, services, availability, bookings] = await Promise.all([
    userRepository.findById(providerId),
    serviceRepository.findByProvider(providerId),
    getAvailability(providerId),
    bookingRepository.findByProvider(providerId),
  ]);
  return {
    provider: toPrivateProvider(provider),
    user: toUserProfile(user),
    services,
    availability,
    bookingStats: {
      total: bookings.length,
      completed: bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED).length,
      cancelled: bookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED).length,
    },
  };
}

const VERIFICATION_MESSAGES = {
  verified: 'Your provider account has been verified. Your profile is now visible to customers.',
  rejected: 'Your provider verification was not approved.',
  suspended: 'Your provider account has been suspended and is hidden from search.',
  pending: 'Your provider account has been returned to the verification queue.',
};

export async function setProviderVerification(admin, providerId, { status, note = '' }) {
  const provider = await providerRepository.findById(providerId);
  if (!provider) throw ApiError.notFound('Provider not found');
  if (provider.accountActive === false && status === VERIFICATION_STATUS.VERIFIED) {
    throw ApiError.badRequest('Reactivate this user account before verifying the provider');
  }

  const timestamp = nowIso();
  const update = { verificationStatus: status, verificationNote: note, verificationUpdatedAt: timestamp, verificationUpdatedBy: admin.uid, updatedAt: timestamp };
  if (status === VERIFICATION_STATUS.VERIFIED) Object.assign(update, { verifiedAt: timestamp, verifiedBy: admin.uid });
  const updated = await providerRepository.update(providerId, update);

  await notificationService.notify(providerId, {
    type: status === VERIFICATION_STATUS.VERIFIED ? NOTIFICATION_TYPES.PROVIDER_VERIFIED : NOTIFICATION_TYPES.PROVIDER_STATUS_CHANGED,
    title: status === VERIFICATION_STATUS.VERIFIED ? 'You are verified!' : 'Verification status updated',
    message: `${VERIFICATION_MESSAGES[status]}${note ? ` Note: ${note}` : ''}`,
    link: '/provider/dashboard',
    data: { verificationStatus: status },
  });
  return toPrivateProvider(updated);
}

/* ---------- Chatbot queries ---------- */

export async function listChatbotQueries({ resolved, page, limit } = {}) {
  return paginate(await chatbotQueryRepository.findAll({ resolved }), { page, limit });
}

export async function resolveChatbotQuery(admin, id, { resolved, adminNote = '' }) {
  const query = await chatbotQueryRepository.findById(id);
  if (!query) throw ApiError.notFound('Chatbot query not found');
  return chatbotQueryRepository.update(id, { resolved, adminNote, reviewedBy: admin.uid, reviewedAt: nowIso() });
}
