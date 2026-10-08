import { getDb } from '../config/firebase.js';
import {
  bookingRepository,
  bookingLockRepository,
  providerRepository,
  serviceRepository,
  userRepository,
  areaRepository,
} from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate } from '../utils/http.js';
import { diffDays, nowIso, nowLocalMinutes, todayLocal } from '../utils/time.js';
import { evaluateSlot } from '../utils/scheduling.js';
import {
  ACTIVE_BOOKING_STATUSES,
  BOOKING_STATUS,
  ERROR_CODES,
  NOTIFICATION_TYPES,
  PROVIDER_BOOKING_TRANSITIONS,
  ROLES,
} from '../constants/index.js';
import { getActiveCategory } from './category.service.js';
import { getAvailability } from './availability.service.js';
import { getSettings } from './settings.service.js';
import { evaluateCancellation } from './booking.policy.js';
import { isPubliclyVisible } from './provider.service.js';
import * as notificationService from './notification/notification.service.js';
import * as paymentService from './payment/payment.service.js';

const bookingLink = (role, id) => `/${role}/bookings/${id}`;
const describe = (b) => `${b.serviceTitle} on ${b.bookingDate} at ${b.startTime}`;

/* ------------------------------------------------------------------ */
/* Access control                                                      */
/* ------------------------------------------------------------------ */

/** BR-10: only the booking's customer, its provider, or an admin may see it. */
export function assertCanView(booking, user) {
  const allowed = user.role === ROLES.ADMIN || booking.customerId === user.uid || booking.providerId === user.uid;
  // 404 rather than 403 so booking IDs cannot be probed.
  if (!allowed) throw ApiError.notFound('Booking not found');
}

export async function getBookingForUser(bookingId, user) {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');
  assertCanView(booking, user);
  return booking;
}

/* ------------------------------------------------------------------ */
/* Create — with double-booking protection                             */
/* ------------------------------------------------------------------ */

/**
 * Creates a booking. Steps (all enforced server-side):
 *  1 validate provider  2 validate service  3 validate date  4 validate slot
 *  5 check availability 6 query existing bookings  7 detect overlap
 *  8 reject on conflict 9 create — steps 6-9 run inside a Firestore transaction.
 */
export async function createBooking(customer, input) {
  const { providerId, serviceId, bookingDate, startTime, customerAddress, customerNotes, areaId } = input;

  // BR-3: a provider cannot book their own service.
  if (customer.uid === providerId) {
    throw ApiError.badRequest('You cannot book your own service', ERROR_CODES.SELF_BOOKING_NOT_ALLOWED);
  }

  // 1. Provider — BR-1: must be verified and active.
  const provider = await providerRepository.findById(providerId);
  if (!isPubliclyVisible(provider)) {
    throw ApiError.badRequest('This provider is not currently accepting bookings', ERROR_CODES.PROVIDER_NOT_VERIFIED);
  }

  // 2. Service — must belong to the provider, be active, and sit in an active category.
  const service = await serviceRepository.findById(serviceId);
  if (!service || service.providerId !== providerId || !service.active) throw ApiError.notFound('Service not found');
  const category = await getActiveCategory(service.categoryId);
  if (!category) throw ApiError.badRequest('This service category is currently unavailable');

  // 3. Date window.
  const settings = await getSettings();
  const today = todayLocal();
  if (bookingDate < today) throw ApiError.badRequest('You cannot book a date in the past', ERROR_CODES.SLOT_UNAVAILABLE);
  if (diffDays(today, bookingDate) > settings.maxAdvanceBookingDays) {
    throw ApiError.badRequest(`Bookings can be made up to ${settings.maxAdvanceBookingDays} days in advance`, ERROR_CODES.SLOT_UNAVAILABLE);
  }

  // Optional area — must be one the provider serves.
  let area = null;
  if (areaId) {
    if (!(provider.areaIds || []).includes(areaId)) throw ApiError.badRequest('This provider does not serve the selected area');
    area = await areaRepository.findById(areaId);
  }

  const availability = await getAvailability(providerId);
  const customerProfile = await userRepository.findById(customer.uid);
  const slotContext = {
    availability,
    date: bookingDate,
    startTime,
    duration: service.duration,
    today,
    nowMinutes: nowLocalMinutes(),
    bufferMinutes: availability.bufferMinutes || 0,
  };

  const bookingRef = bookingRepository.ref();
  const lockRef = bookingLockRepository.ref(bookingLockRepository.lockId(providerId, bookingDate));
  const timestamp = nowIso();

  // 4-9. Read the provider's bookings for the day and write the new booking atomically.
  // The per-provider/day lock document forces concurrent transactions for the same day to
  // contend on the same document, so Firestore serialises them and retries the loser.
  const booking = await getDb().runTransaction(async (tx) => {
    const lockSnap = await tx.get(lockRef);
    const daySnap = await tx.get(bookingRepository.providerDayQuery(providerId, bookingDate));
    const existingBookings = daySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const result = evaluateSlot({ ...slotContext, existingBookings });
    if (!result.ok) {
      const code = result.code === 'CONFLICT' ? ERROR_CODES.BOOKING_CONFLICT : ERROR_CODES.SLOT_UNAVAILABLE;
      throw ApiError.conflict(result.reason, code);
    }

    const record = {
      customerId: customer.uid,
      customerName: customerProfile?.displayName || customer.displayName || 'Customer',
      customerPhone: input.customerPhone || customerProfile?.phone || '',
      providerId,
      providerName: provider.businessName || provider.displayName,
      serviceId,
      serviceTitle: service.title,
      categoryId: service.categoryId,
      categoryName: category.name,
      bookingDate,
      startTime,
      endTime: result.endTime,
      duration: service.duration,
      price: service.price,
      pricingType: service.pricingType,
      areaId: area?.id || '',
      areaName: area ? `${area.areaName}, ${area.city}` : '',
      customerAddress,
      customerNotes: customerNotes || '',
      providerNotes: '',
      status: BOOKING_STATUS.PENDING,
      paymentStatus: 'cash',
      paymentMethod: 'cash',
      reviewed: false,
      statusHistory: [{ status: BOOKING_STATUS.PENDING, at: timestamp, by: customer.uid }],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    tx.set(bookingRef, record);
    tx.set(
      lockRef,
      { providerId, bookingDate, bookingCount: (lockSnap.exists ? lockSnap.data().bookingCount || 0 : 0) + 1, updatedAt: timestamp },
      { merge: true },
    );
    return { id: bookingRef.id, ...record };
  });

  // Payment setup happens after the slot is secured; failures fall back to cash.
  const payment = await paymentService.initializeBookingPayment(booking);
  const { clientSecret, ...paymentFields } = payment;
  await bookingRepository.update(booking.id, paymentFields);
  Object.assign(booking, paymentFields);

  await Promise.all([
    notificationService.notify(providerId, {
      type: NOTIFICATION_TYPES.BOOKING_CREATED,
      title: 'New booking request',
      message: `${booking.customerName} requested ${describe(booking)}.`,
      link: bookingLink('provider', booking.id),
      data: { bookingId: booking.id },
    }),
    notificationService.notify(customer.uid, {
      type: NOTIFICATION_TYPES.BOOKING_CREATED,
      title: 'Booking request sent',
      message: `Your request for ${describe(booking)} was sent to ${booking.providerName}.`,
      link: bookingLink('customer', booking.id),
      data: { bookingId: booking.id },
    }),
  ]);

  return { ...booking, ...(clientSecret ? { clientSecret } : {}) };
}

/* ------------------------------------------------------------------ */
/* Listing                                                             */
/* ------------------------------------------------------------------ */

const applyListFilters = (bookings, { status, scope }) => {
  const today = todayLocal();
  return bookings.filter((b) => {
    if (status && b.status !== status) return false;
    if (scope === 'upcoming') return b.bookingDate >= today && ACTIVE_BOOKING_STATUSES.includes(b.status);
    if (scope === 'past') return b.bookingDate < today || !ACTIVE_BOOKING_STATUSES.includes(b.status);
    return true;
  });
};

const sortForScope = (scope) =>
  scope === 'upcoming'
    ? (a, b) => `${a.bookingDate}${a.startTime}`.localeCompare(`${b.bookingDate}${b.startTime}`)
    : (a, b) => `${b.bookingDate}${b.startTime}`.localeCompare(`${a.bookingDate}${a.startTime}`);

export async function listMyBookings(user, query = {}) {
  const source =
    user.role === ROLES.PROVIDER ? await bookingRepository.findByProvider(user.uid) : await bookingRepository.findByCustomer(user.uid);
  const filtered = applyListFilters(source, query).sort(sortForScope(query.scope));
  return paginate(filtered, query);
}

export async function listAllBookings(query = {}) {
  let bookings = await bookingRepository.findAll();
  if (query.providerId) bookings = bookings.filter((b) => b.providerId === query.providerId);
  if (query.customerId) bookings = bookings.filter((b) => b.customerId === query.customerId);
  if (query.from) bookings = bookings.filter((b) => b.bookingDate >= query.from);
  if (query.to) bookings = bookings.filter((b) => b.bookingDate <= query.to);
  return paginate(applyListFilters(bookings, query).sort(sortForScope(query.scope)), query);
}

/* ------------------------------------------------------------------ */
/* Status changes                                                      */
/* ------------------------------------------------------------------ */

const STATUS_NOTIFICATIONS = {
  confirmed: { type: NOTIFICATION_TYPES.BOOKING_CONFIRMED, title: 'Booking confirmed', verb: 'confirmed' },
  rejected: { type: NOTIFICATION_TYPES.BOOKING_REJECTED, title: 'Booking declined', verb: 'declined' },
  cancelled: { type: NOTIFICATION_TYPES.BOOKING_CANCELLED, title: 'Booking cancelled', verb: 'cancelled' },
  completed: { type: NOTIFICATION_TYPES.BOOKING_COMPLETED, title: 'Booking completed', verb: 'marked as completed' },
  in_progress: { type: NOTIFICATION_TYPES.BOOKING_UPDATED, title: 'Service started', verb: 'started' },
  pending: { type: NOTIFICATION_TYPES.BOOKING_UPDATED, title: 'Booking updated', verb: 'moved back to pending' },
};

/**
 * Provider: pending→confirmed|rejected, confirmed→in_progress|completed|cancelled, in_progress→completed.
 * Admin: may set any status (support override). Customers cancel through cancelBooking().
 */
export async function updateBookingStatus(user, bookingId, { status, providerNotes, paymentStatus }) {
  const booking = await getBookingForUser(bookingId, user);
  const isAdmin = user.role === ROLES.ADMIN;
  const isProvider = user.role === ROLES.PROVIDER && booking.providerId === user.uid;

  if (!isAdmin && !isProvider) {
    throw ApiError.forbidden('Only the provider can update this booking. To cancel, use the cancel option.');
  }
  if (!isAdmin) {
    const allowed = PROVIDER_BOOKING_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(status)) {
      throw ApiError.badRequest(
        `A ${booking.status.replace('_', ' ')} booking cannot be changed to ${status.replace('_', ' ')}`,
        ERROR_CODES.INVALID_STATUS_TRANSITION,
      );
    }
  }
  if (status === BOOKING_STATUS.COMPLETED && booking.bookingDate > todayLocal()) {
    throw ApiError.badRequest('A booking cannot be completed before its scheduled date', ERROR_CODES.INVALID_STATUS_TRANSITION);
  }

  const timestamp = nowIso();
  const update = {
    status,
    updatedAt: timestamp,
    statusHistory: [...(booking.statusHistory || []), { status, at: timestamp, by: user.uid }],
  };
  if (providerNotes !== undefined) update.providerNotes = providerNotes;
  if (paymentStatus) update.paymentStatus = paymentStatus;
  if (status === BOOKING_STATUS.CANCELLED) Object.assign(update, { cancelledBy: isAdmin ? 'admin' : 'provider', cancelledAt: timestamp });
  if (status === BOOKING_STATUS.COMPLETED) update.completedAt = timestamp;

  const wasCompleted = booking.status === BOOKING_STATUS.COMPLETED;
  const nowCompleted = status === BOOKING_STATUS.COMPLETED;

  await getDb().runTransaction(async (tx) => {
    const providerRef = providerRepository.ref(booking.providerId);
    const providerSnap = await tx.get(providerRef);
    tx.update(bookingRepository.ref(bookingId), update);
    if (providerSnap.exists && wasCompleted !== nowCompleted) {
      const current = providerSnap.data().completedBookings || 0;
      tx.update(providerRef, { completedBookings: Math.max(current + (nowCompleted ? 1 : -1), 0) });
    }
  });

  const updated = { ...booking, ...update };
  const template = STATUS_NOTIFICATIONS[status];
  if (template && status !== booking.status) {
    const message =
      status === BOOKING_STATUS.COMPLETED
        ? `Your booking for ${describe(updated)} is complete. Please leave a review for ${updated.providerName}.`
        : `Your booking for ${describe(updated)} was ${template.verb} by ${isAdmin ? 'Fixora support' : updated.providerName}.`;
    await notificationService.notify(booking.customerId, {
      type: template.type,
      title: template.title,
      message,
      link: bookingLink('customer', bookingId),
      data: { bookingId },
    });
    if (isAdmin) {
      await notificationService.notify(booking.providerId, {
        type: template.type,
        title: template.title,
        message: `Booking for ${describe(updated)} was ${template.verb} by Fixora support.`,
        link: bookingLink('provider', bookingId),
        data: { bookingId },
      });
    }
  }
  return updated;
}

export async function updatePaymentStatus(user, bookingId, paymentStatus) {
  const booking = await getBookingForUser(bookingId, user);
  if (user.role !== ROLES.ADMIN && booking.providerId !== user.uid) throw ApiError.forbidden();
  return bookingRepository.update(bookingId, { paymentStatus, updatedAt: nowIso() });
}

/* ------------------------------------------------------------------ */
/* Cancellation (customer) — BR-6, BR-9                                 */
/* ------------------------------------------------------------------ */

export async function getCancellationPreview(user, bookingId) {
  const booking = await getBookingForUser(bookingId, user);
  if (booking.customerId !== user.uid) throw ApiError.forbidden('Only the customer who made this booking can cancel it');
  return evaluateCancellation(booking, await getSettings());
}

export async function cancelBooking(user, bookingId, { reason = '', acknowledgeLateCancellation = false } = {}) {
  const booking = await getBookingForUser(bookingId, user);
  // BR-9: only the booking owner can cancel.
  if (booking.customerId !== user.uid) throw ApiError.forbidden('Only the customer who made this booking can cancel it');

  const decision = evaluateCancellation(booking, await getSettings());
  if (!decision.canCancel) throw ApiError.conflict(decision.message, ERROR_CODES.CANCELLATION_NOT_ALLOWED, decision);
  if (decision.isLate && !acknowledgeLateCancellation) {
    throw ApiError.conflict(decision.message, ERROR_CODES.LATE_CANCELLATION_CONFIRMATION_REQUIRED, decision);
  }

  const timestamp = nowIso();
  const updated = await bookingRepository.update(bookingId, {
    status: BOOKING_STATUS.CANCELLED,
    cancelledBy: 'customer',
    cancelledAt: timestamp,
    cancellationReason: reason,
    lateCancellation: decision.isLate,
    cancellationFee: decision.fee,
    updatedAt: timestamp,
    statusHistory: [...(booking.statusHistory || []), { status: BOOKING_STATUS.CANCELLED, at: timestamp, by: user.uid }],
  });

  if (booking.paymentStatus === 'paid') await paymentService.refundBookingPayment(booking);

  await notificationService.notify(booking.providerId, {
    type: NOTIFICATION_TYPES.BOOKING_CANCELLED,
    title: 'Booking cancelled by customer',
    message: `${booking.customerName} cancelled ${describe(booking)}.${reason ? ` Reason: ${reason}` : ''}`,
    link: bookingLink('provider', bookingId),
    data: { bookingId },
  });
  return updated;
}

/** Used when an account is deleted: cancels future active bookings without fees. */
export async function cancelActiveBookingsForAccountClosure(user) {
  const today = todayLocal();
  const isProvider = user.role === ROLES.PROVIDER;
  const bookings = isProvider ? await bookingRepository.findByProvider(user.uid) : await bookingRepository.findByCustomer(user.uid);
  const active = bookings.filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status) && b.bookingDate >= today);
  const timestamp = nowIso();
  await Promise.all(
    active.map(async (b) => {
      await bookingRepository.update(b.id, {
        status: BOOKING_STATUS.CANCELLED,
        cancelledBy: isProvider ? 'provider' : 'customer',
        cancellationReason: 'Account closed',
        cancelledAt: timestamp,
        updatedAt: timestamp,
      });
      await notificationService.notify(isProvider ? b.customerId : b.providerId, {
        type: NOTIFICATION_TYPES.BOOKING_CANCELLED,
        title: 'Booking cancelled',
        message: `The booking for ${describe(b)} was cancelled because the other party closed their account.`,
        link: bookingLink(isProvider ? 'customer' : 'provider', b.id),
        data: { bookingId: b.id },
      });
    }),
  );
  return active.length;
}
