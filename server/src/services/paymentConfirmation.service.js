import { getDb } from '../config/firebase.js';
import { paymentRepository, bookingRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate } from '../utils/http.js';
import { nowIso } from '../utils/time.js';
import { AUDIT_ACTIONS, BOOKING_STATUS, NOTIFICATION_TYPES, PAYMENT_CONFIRMATION_STATUS, ROLES } from '../constants/index.js';
import * as notificationService from './notification/notification.service.js';
import * as auditLogService from './auditLog.service.js';
import * as complaintService from './complaint.service.js';
import { createCommissionForBooking } from './commission.service.js';

/*
 * Dual-confirmation payment flow: once a booking is completed, the customer confirms they
 * paid and the provider confirms they received it — independently, in either order. Only
 * when BOTH flags are true does the record become `paid`, which is the single trigger for
 * automatic commission creation. Every write happens inside a Firestore transaction keyed
 * on the payment doc (id == bookingId) so concurrent/retried requests can never double-count
 * a confirmation or race the paid transition.
 */

const link = (role, bookingId) => `/${role}/bookings/${bookingId}`;

function deriveStatus(customerConfirmed, providerConfirmed) {
  if (customerConfirmed && providerConfirmed) return PAYMENT_CONFIRMATION_STATUS.PAID;
  if (providerConfirmed) return PAYMENT_CONFIRMATION_STATUS.PROVIDER_CONFIRMED;
  if (customerConfirmed) return PAYMENT_CONFIRMATION_STATUS.CUSTOMER_CONFIRMED;
  return PAYMENT_CONFIRMATION_STATUS.PENDING;
}

function assertCanView(payment, user) {
  const allowed = user.role === ROLES.ADMIN || payment.customerId === user.uid || payment.providerId === user.uid;
  if (!allowed) throw ApiError.notFound('Payment record not found');
}

export async function getPaymentForBooking(bookingId, user) {
  const payment = await paymentRepository.findById(bookingId);
  if (!payment) throw ApiError.notFound('Payment record not found');
  assertCanView(payment, user);
  return payment;
}

async function loadCompletedBooking(bookingId, user, { requireRole }) {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');
  const isCustomer = requireRole === ROLES.CUSTOMER && booking.customerId === user.uid;
  const isProvider = requireRole === ROLES.PROVIDER && booking.providerId === user.uid;
  if (!isCustomer && !isProvider) throw ApiError.notFound('Booking not found');
  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    throw ApiError.badRequest('Payment can only be confirmed once the booking is marked completed');
  }
  return booking;
}

async function confirm(user, bookingId, { method, reference }, side) {
  const role = side === 'customer' ? ROLES.CUSTOMER : ROLES.PROVIDER;
  const booking = await loadCompletedBooking(bookingId, user, { requireRole: role });
  const ref = paymentRepository.ref(bookingId);
  const timestamp = nowIso();

  const { payment, justCompleted } = await getDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = snap.exists ? snap.data() : null;
    if (existing && [PAYMENT_CONFIRMATION_STATUS.DISPUTED, PAYMENT_CONFIRMATION_STATUS.REFUNDED].includes(existing.status)) {
      throw ApiError.badRequest('This payment has already been resolved by support and cannot be reconfirmed');
    }
    const base = existing || {
      bookingId,
      customerId: booking.customerId,
      customerName: booking.customerName,
      providerId: booking.providerId,
      providerName: booking.providerName,
      serviceId: booking.serviceId,
      serviceTitle: booking.serviceTitle,
      amountGBP: booking.price || 0,
      customerConfirmed: false,
      customerConfirmedAt: '',
      customerMethod: '',
      customerReference: '',
      providerConfirmed: false,
      providerConfirmedAt: '',
      providerMethod: '',
      providerReference: '',
      status: PAYMENT_CONFIRMATION_STATUS.PENDING,
      disputeReason: '',
      disputedBy: '',
      disputedAt: '',
      createdAt: timestamp,
    };

    const wasPaid = base.status === PAYMENT_CONFIRMATION_STATUS.PAID;
    const update =
      side === 'customer'
        ? { customerConfirmed: true, customerConfirmedAt: timestamp, customerMethod: method, customerReference: reference || '' }
        : { providerConfirmed: true, providerConfirmedAt: timestamp, providerMethod: method, providerReference: reference || '' };

    const next = { ...base, ...update };
    next.status = deriveStatus(next.customerConfirmed, next.providerConfirmed);
    next.updatedAt = timestamp;

    tx.set(ref, next, { merge: true });
    return { payment: { id: bookingId, ...next }, justCompleted: !wasPaid && next.status === PAYMENT_CONFIRMATION_STATUS.PAID };
  });

  await auditLogService.record({
    action: side === 'customer' ? AUDIT_ACTIONS.PAYMENT_CUSTOMER_CONFIRMED : AUDIT_ACTIONS.PAYMENT_PROVIDER_CONFIRMED,
    actorId: user.uid,
    actorRole: user.role,
    actorName: user.displayName,
    bookingId,
    amountGBP: payment.amountGBP,
    details: `${side === 'customer' ? 'Customer' : 'Provider'} confirmed ${method.replace('_', ' ')} payment of £${Number(payment.amountGBP).toFixed(2)}${reference ? ` (ref: ${reference})` : ''}`,
  });

  const otherPartyId = side === 'customer' ? booking.providerId : booking.customerId;
  const otherPartyRole = side === 'customer' ? 'provider' : 'customer';
  if (justCompleted) {
    await Promise.all([
      notificationService.notify(booking.customerId, {
        type: NOTIFICATION_TYPES.PAYMENT_CONFIRMED,
        title: 'Payment confirmed',
        message: `Payment of £${Number(payment.amountGBP).toFixed(2)} for "${booking.serviceTitle}" is confirmed by both parties.`,
        link: link('customer', bookingId),
        data: { bookingId },
      }),
      notificationService.notify(booking.providerId, {
        type: NOTIFICATION_TYPES.PAYMENT_CONFIRMED,
        title: 'Payment confirmed',
        message: `Payment of £${Number(payment.amountGBP).toFixed(2)} for "${booking.serviceTitle}" is confirmed by both parties.`,
        link: link('provider', bookingId),
        data: { bookingId },
      }),
    ]);
    await createCommissionForBooking(booking);
  } else {
    await notificationService.notify(otherPartyId, {
      type: NOTIFICATION_TYPES.PAYMENT_CONFIRMATION_NEEDED,
      title: 'Confirm payment',
      message: `${side === 'customer' ? booking.customerName : booking.providerName} confirmed a payment of £${Number(payment.amountGBP).toFixed(2)} for "${booking.serviceTitle}". Please confirm.`,
      link: link(otherPartyRole, bookingId),
      data: { bookingId },
    });
  }
  return payment;
}

export const confirmByCustomer = (user, bookingId, input) => confirm(user, bookingId, input, 'customer');
export const confirmByProvider = (user, bookingId, input) => confirm(user, bookingId, input, 'provider');

export async function disputePayment(user, bookingId, { reason }) {
  const payment = await getPaymentForBooking(bookingId, user);
  const timestamp = nowIso();
  const updated = await paymentRepository.update(bookingId, {
    status: PAYMENT_CONFIRMATION_STATUS.DISPUTED,
    disputeReason: reason,
    disputedBy: user.uid,
    disputedAt: timestamp,
    updatedAt: timestamp,
  });

  const complaint = await complaintService.createComplaint(user, {
    type: 'payment',
    bookingId,
    providerId: payment.providerId,
    subject: `Payment dispute — ${payment.serviceTitle}`,
    description: reason,
  });

  await auditLogService.record({
    action: AUDIT_ACTIONS.PAYMENT_DISPUTED,
    actorId: user.uid,
    actorRole: user.role,
    actorName: user.displayName,
    bookingId,
    amountGBP: payment.amountGBP,
    details: `Disputed: ${reason} (complaint ${complaint.id})`,
  });
  return updated;
}

export async function resolveDispute(admin, bookingId, { resolution, note = '' }) {
  const payment = await paymentRepository.findById(bookingId);
  if (!payment) throw ApiError.notFound('Payment record not found');
  if (payment.status !== PAYMENT_CONFIRMATION_STATUS.DISPUTED) throw ApiError.badRequest('Only a disputed payment can be resolved');

  const timestamp = nowIso();
  const status = resolution === 'paid' ? PAYMENT_CONFIRMATION_STATUS.PAID : PAYMENT_CONFIRMATION_STATUS.REFUNDED;
  const updated = await paymentRepository.update(bookingId, { status, updatedAt: timestamp });

  await auditLogService.record({
    action: AUDIT_ACTIONS.PAYMENT_DISPUTE_RESOLVED,
    actorId: admin.uid,
    actorRole: admin.role,
    actorName: admin.displayName,
    bookingId,
    amountGBP: payment.amountGBP,
    details: note || `Dispute resolved as ${resolution}`,
  });
  await Promise.all([
    notificationService.notify(payment.customerId, {
      type: NOTIFICATION_TYPES.PAYMENT_CONFIRMED,
      title: 'Payment dispute resolved',
      message: `Your payment dispute for "${payment.serviceTitle}" was resolved: marked as ${resolution}.${note ? ` ${note}` : ''}`,
      link: link('customer', bookingId),
      data: { bookingId },
    }),
    notificationService.notify(payment.providerId, {
      type: NOTIFICATION_TYPES.PAYMENT_CONFIRMED,
      title: 'Payment dispute resolved',
      message: `The payment dispute for "${payment.serviceTitle}" was resolved: marked as ${resolution}.${note ? ` ${note}` : ''}`,
      link: link('provider', bookingId),
      data: { bookingId },
    }),
  ]);

  if (status === PAYMENT_CONFIRMATION_STATUS.PAID) {
    const booking = await bookingRepository.findById(bookingId);
    if (booking) await createCommissionForBooking(booking);
  }
  return updated;
}

export async function listAllPayments(query = {}) {
  let payments = await paymentRepository.findAll(query.status);
  if (query.providerId) payments = payments.filter((p) => p.providerId === query.providerId);
  if (query.customerId) payments = payments.filter((p) => p.customerId === query.customerId);
  if (query.q) {
    const needle = query.q.toLowerCase();
    payments = payments.filter((p) => `${p.customerName} ${p.providerName} ${p.serviceTitle} ${p.bookingId}`.toLowerCase().includes(needle));
  }
  return paginate(payments, query);
}
