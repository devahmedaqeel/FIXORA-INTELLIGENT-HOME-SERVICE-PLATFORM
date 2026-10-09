import { getDb } from '../config/firebase.js';
import { commissionRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate } from '../utils/http.js';
import { addDays, nowIso, todayLocal } from '../utils/time.js';
import { getSettings } from './settings.service.js';
import * as notificationService from './notification/notification.service.js';
import * as auditLogService from './auditLog.service.js';
import * as complaintService from './complaint.service.js';
import { AUDIT_ACTIONS, COMMISSION_STATUS, NOTIFICATION_TYPES, ROLES } from '../constants/index.js';

const round2 = (n) => Math.round(n * 100) / 100;
const link = (role, commissionId) => `/${role}/commissions/${commissionId}`;

function assertCanView(commission, user) {
  const allowed = user.role === ROLES.ADMIN || commission.providerId === user.uid;
  if (!allowed) throw ApiError.notFound('Commission not found');
}

export async function getCommissionForUser(id, user) {
  const commission = await commissionRepository.findById(id);
  if (!commission) throw ApiError.notFound('Commission not found');
  assertCanView(commission, user);
  return commission;
}

/**
 * The ONLY place a commission record is created. Triggered exclusively by
 * paymentConfirmation.service.js once a booking's payment reaches `paid`. The commission id
 * equals the bookingId, and the Firestore transaction below re-checks existence before
 * writing, so calling this twice (e.g. a retried request) can never create a duplicate.
 */
export async function createCommissionForBooking(booking) {
  const ref = commissionRepository.ref(booking.id);
  const settings = await getSettings();
  const timestamp = nowIso();

  const created = await getDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return null; // already created — idempotent no-op

    const commissionAmountGBP = round2((booking.price || 0) * (settings.commissionRatePercent / 100));
    const record = {
      bookingId: booking.id,
      providerId: booking.providerId,
      providerName: booking.providerName,
      customerId: booking.customerId,
      customerName: booking.customerName,
      serviceTitle: booking.serviceTitle,
      serviceAmountGBP: booking.price || 0,
      commissionRatePercent: settings.commissionRatePercent,
      commissionAmountGBP,
      providerEarningsGBP: round2((booking.price || 0) - commissionAmountGBP),
      paidAmountGBP: 0,
      remainingAmountGBP: commissionAmountGBP,
      status: COMMISSION_STATUS.DUE,
      dueDate: addDays(todayLocal(), settings.commissionPaymentDeadlineDays),
      paymentSubmission: null,
      submissionHistory: [],
      rejectionReason: '',
      rejectedBy: '',
      rejectedAt: '',
      verifiedBy: '',
      verifiedAt: '',
      verificationNote: '',
      waiverReason: '',
      waivedBy: '',
      waivedAt: '',
      disputeReason: '',
      disputedBy: '',
      disputedAt: '',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    tx.set(ref, record);
    return { id: booking.id, ...record };
  });

  if (!created) return commissionRepository.findById(booking.id);

  await auditLogService.record({
    action: AUDIT_ACTIONS.COMMISSION_CREATED,
    actorId: 'system',
    actorRole: 'system',
    bookingId: booking.id,
    commissionId: booking.id,
    amountGBP: created.commissionAmountGBP,
    details: `Commission of £${created.commissionAmountGBP.toFixed(2)} (${settings.commissionRatePercent}%) generated for booking ${booking.id}`,
  });
  await notificationService.notify(booking.providerId, {
    type: NOTIFICATION_TYPES.COMMISSION_DUE,
    title: 'Commission payment due',
    message: `You owe £${created.commissionAmountGBP.toFixed(2)} commission for "${booking.serviceTitle}", due by ${created.dueDate}.`,
    link: link('provider', booking.id),
    data: { commissionId: booking.id, bookingId: booking.id },
  });
  return created;
}

/** Lazily transitions due/partially-paid commissions past their deadline to 'overdue'. */
async function sweepOverdue(commissions) {
  const today = todayLocal();
  const stale = commissions.filter((c) => [COMMISSION_STATUS.DUE, COMMISSION_STATUS.PARTIALLY_PAID].includes(c.status) && c.dueDate < today);
  if (!stale.length) return commissions;

  const timestamp = nowIso();
  await Promise.all(
    stale.map(async (c) => {
      await commissionRepository.update(c.id, { status: COMMISSION_STATUS.OVERDUE, updatedAt: timestamp });
      await auditLogService.record({
        action: AUDIT_ACTIONS.COMMISSION_MARKED_OVERDUE,
        actorId: 'system',
        actorRole: 'system',
        bookingId: c.bookingId,
        commissionId: c.id,
        amountGBP: c.remainingAmountGBP,
        details: `Commission passed its due date of ${c.dueDate} unpaid`,
      });
      await notificationService.notify(c.providerId, {
        type: NOTIFICATION_TYPES.COMMISSION_OVERDUE,
        title: 'Commission payment overdue',
        message: `Your commission of £${c.remainingAmountGBP.toFixed(2)} for "${c.serviceTitle}" is now overdue.`,
        link: link('provider', c.id),
        data: { commissionId: c.id },
      });
    }),
  );
  const staleIds = new Set(stale.map((c) => c.id));
  return commissions.map((c) => (staleIds.has(c.id) ? { ...c, status: COMMISSION_STATUS.OVERDUE } : c));
}

export async function listMyCommissions(user, query = {}) {
  const commissions = await sweepOverdue(await commissionRepository.findByProvider(user.uid));
  const filtered = query.status ? commissions.filter((c) => c.status === query.status) : commissions;
  return paginate(filtered, query);
}

export async function listAllCommissions(query = {}) {
  let commissions = await sweepOverdue(await commissionRepository.findAll());
  if (query.status) commissions = commissions.filter((c) => c.status === query.status);
  if (query.providerId) commissions = commissions.filter((c) => c.providerId === query.providerId);
  if (query.q) {
    const needle = query.q.toLowerCase();
    commissions = commissions.filter((c) => `${c.providerName} ${c.serviceTitle} ${c.bookingId}`.toLowerCase().includes(needle));
  }
  return paginate(commissions, query);
}

export async function getCommissionDetail(id, user) {
  const commission = await getCommissionForUser(id, user);
  const timeline = await auditLogService.timelineForCommission(id);
  return { commission, timeline };
}

/* ------------------------------------------------------------------ */
/* Provider actions                                                    */
/* ------------------------------------------------------------------ */

const SUBMITTABLE_STATUSES = [COMMISSION_STATUS.DUE, COMMISSION_STATUS.PARTIALLY_PAID, COMMISSION_STATUS.OVERDUE, COMMISSION_STATUS.REJECTED];

export async function submitPayment(provider, id, { method, reference, proofUrl, proofPath, amountGBP }) {
  const commission = await getCommissionForUser(id, provider);
  if (commission.providerId !== provider.uid) throw ApiError.forbidden();
  if (!SUBMITTABLE_STATUSES.includes(commission.status)) {
    throw ApiError.badRequest(`A commission that is ${commission.status.replace('_', ' ')} cannot have a payment submitted`);
  }

  const timestamp = nowIso();
  const submission = { method, reference: reference || '', proofUrl: proofUrl || '', proofPath: proofPath || '', amountGBP, submittedAt: timestamp };
  const updated = await commissionRepository.update(id, {
    status: COMMISSION_STATUS.UNDER_REVIEW,
    paymentSubmission: submission,
    submissionHistory: [...(commission.submissionHistory || []), submission],
    rejectionReason: '',
    updatedAt: timestamp,
  });

  await auditLogService.record({
    action: AUDIT_ACTIONS.COMMISSION_PAYMENT_SUBMITTED,
    actorId: provider.uid,
    actorRole: provider.role,
    actorName: provider.displayName,
    bookingId: commission.bookingId,
    commissionId: id,
    amountGBP,
    details: `Provider submitted ${method.replace('_', ' ')} payment of £${Number(amountGBP).toFixed(2)}${reference ? ` (ref: ${reference})` : ''}`,
  });
  return updated;
}

export async function disputeCommission(user, id, { reason }) {
  const commission = await getCommissionForUser(id, user);
  const timestamp = nowIso();
  const updated = await commissionRepository.update(id, {
    status: COMMISSION_STATUS.DISPUTED,
    disputeReason: reason,
    disputedBy: user.uid,
    disputedAt: timestamp,
    updatedAt: timestamp,
  });

  const complaint = await complaintService.createComplaint(user, {
    type: 'payment',
    bookingId: commission.bookingId,
    providerId: commission.providerId,
    subject: `Commission dispute — ${commission.serviceTitle}`,
    description: reason,
  });

  await auditLogService.record({
    action: AUDIT_ACTIONS.COMMISSION_DISPUTED,
    actorId: user.uid,
    actorRole: user.role,
    actorName: user.displayName,
    bookingId: commission.bookingId,
    commissionId: id,
    amountGBP: commission.remainingAmountGBP,
    details: `Disputed: ${reason} (complaint ${complaint.id})`,
  });
  return updated;
}

/* ------------------------------------------------------------------ */
/* Admin actions — the only paths that can mark a commission paid      */
/* ------------------------------------------------------------------ */

const REVIEWABLE_STATUSES = [COMMISSION_STATUS.UNDER_REVIEW, COMMISSION_STATUS.PARTIALLY_PAID, COMMISSION_STATUS.OVERDUE, COMMISSION_STATUS.DISPUTED];

export async function verifyCommission(admin, id, { note = '' } = {}) {
  const commission = await commissionRepository.findById(id);
  if (!commission) throw ApiError.notFound('Commission not found');
  if (!REVIEWABLE_STATUSES.includes(commission.status)) {
    throw ApiError.badRequest(`A commission that is ${commission.status.replace('_', ' ')} cannot be verified`);
  }

  const timestamp = nowIso();
  const updated = await commissionRepository.update(id, {
    status: COMMISSION_STATUS.PAID,
    paidAmountGBP: commission.commissionAmountGBP,
    remainingAmountGBP: 0,
    verifiedBy: admin.uid,
    verifiedAt: timestamp,
    verificationNote: note,
    updatedAt: timestamp,
  });

  await auditLogService.record({
    action: AUDIT_ACTIONS.COMMISSION_VERIFIED,
    actorId: admin.uid,
    actorRole: admin.role,
    actorName: admin.displayName,
    bookingId: commission.bookingId,
    commissionId: id,
    amountGBP: commission.commissionAmountGBP,
    details: note || `Commission payment of £${commission.commissionAmountGBP.toFixed(2)} verified`,
  });
  await notificationService.notify(commission.providerId, {
    type: NOTIFICATION_TYPES.COMMISSION_VERIFIED,
    title: 'Commission payment verified',
    message: `Your commission payment of £${commission.commissionAmountGBP.toFixed(2)} for "${commission.serviceTitle}" has been verified.`,
    link: link('provider', id),
    data: { commissionId: id },
  });
  return updated;
}

export async function rejectCommission(admin, id, { reason }) {
  const commission = await commissionRepository.findById(id);
  if (!commission) throw ApiError.notFound('Commission not found');
  if (commission.status !== COMMISSION_STATUS.UNDER_REVIEW) {
    throw ApiError.badRequest('Only a commission under review can be rejected');
  }

  const timestamp = nowIso();
  const updated = await commissionRepository.update(id, {
    status: COMMISSION_STATUS.REJECTED,
    rejectionReason: reason,
    rejectedBy: admin.uid,
    rejectedAt: timestamp,
    updatedAt: timestamp,
  });

  await auditLogService.record({
    action: AUDIT_ACTIONS.COMMISSION_REJECTED,
    actorId: admin.uid,
    actorRole: admin.role,
    actorName: admin.displayName,
    bookingId: commission.bookingId,
    commissionId: id,
    amountGBP: commission.remainingAmountGBP,
    details: reason,
  });
  await notificationService.notify(commission.providerId, {
    type: NOTIFICATION_TYPES.COMMISSION_REJECTED,
    title: 'Commission payment rejected',
    message: `Your commission payment submission for "${commission.serviceTitle}" was rejected: ${reason}. Please resubmit.`,
    link: link('provider', id),
    data: { commissionId: id },
  });
  return updated;
}

export async function recordPartialPayment(admin, id, { amountGBP, note = '' }) {
  const commission = await commissionRepository.findById(id);
  if (!commission) throw ApiError.notFound('Commission not found');
  if (!REVIEWABLE_STATUSES.includes(commission.status) && commission.status !== COMMISSION_STATUS.DUE) {
    throw ApiError.badRequest(`A commission that is ${commission.status.replace('_', ' ')} cannot record a payment`);
  }
  if (amountGBP <= 0 || amountGBP > commission.remainingAmountGBP) {
    throw ApiError.badRequest(`Amount must be between £0.01 and £${commission.remainingAmountGBP.toFixed(2)}`);
  }

  const timestamp = nowIso();
  const paidAmountGBP = round2(commission.paidAmountGBP + amountGBP);
  const remainingAmountGBP = round2(commission.commissionAmountGBP - paidAmountGBP);
  const fullyPaid = remainingAmountGBP <= 0;
  const updated = await commissionRepository.update(id, {
    status: fullyPaid ? COMMISSION_STATUS.PAID : COMMISSION_STATUS.PARTIALLY_PAID,
    paidAmountGBP,
    remainingAmountGBP: Math.max(remainingAmountGBP, 0),
    verifiedBy: fullyPaid ? admin.uid : commission.verifiedBy,
    verifiedAt: fullyPaid ? timestamp : commission.verifiedAt,
    updatedAt: timestamp,
  });

  await auditLogService.record({
    action: AUDIT_ACTIONS.COMMISSION_PARTIALLY_PAID,
    actorId: admin.uid,
    actorRole: admin.role,
    actorName: admin.displayName,
    bookingId: commission.bookingId,
    commissionId: id,
    amountGBP,
    details: note || `Partial payment of £${amountGBP.toFixed(2)} recorded`,
  });
  await notificationService.notify(commission.providerId, {
    type: fullyPaid ? NOTIFICATION_TYPES.COMMISSION_VERIFIED : NOTIFICATION_TYPES.COMMISSION_DUE,
    title: fullyPaid ? 'Commission payment verified' : 'Partial commission payment recorded',
    message: fullyPaid
      ? `Your commission for "${commission.serviceTitle}" is fully settled.`
      : `£${amountGBP.toFixed(2)} was recorded against your commission for "${commission.serviceTitle}". £${remainingAmountGBP.toFixed(2)} remaining.`,
    link: link('provider', id),
    data: { commissionId: id },
  });
  return updated;
}

export async function waiveCommission(admin, id, { reason }) {
  const commission = await commissionRepository.findById(id);
  if (!commission) throw ApiError.notFound('Commission not found');
  if (commission.status === COMMISSION_STATUS.PAID) throw ApiError.badRequest('A paid commission cannot be waived');

  const timestamp = nowIso();
  const updated = await commissionRepository.update(id, {
    status: COMMISSION_STATUS.WAIVED,
    waiverReason: reason,
    waivedBy: admin.uid,
    waivedAt: timestamp,
    remainingAmountGBP: 0,
    updatedAt: timestamp,
  });

  await auditLogService.record({
    action: AUDIT_ACTIONS.COMMISSION_WAIVED,
    actorId: admin.uid,
    actorRole: admin.role,
    actorName: admin.displayName,
    bookingId: commission.bookingId,
    commissionId: id,
    amountGBP: commission.remainingAmountGBP,
    details: reason,
  });
  await notificationService.notify(commission.providerId, {
    type: NOTIFICATION_TYPES.COMMISSION_WAIVED,
    title: 'Commission waived',
    message: `Your commission for "${commission.serviceTitle}" has been waived by Fixora support.${reason ? ` Reason: ${reason}` : ''}`,
    link: link('provider', id),
    data: { commissionId: id },
  });
  return updated;
}

/* ------------------------------------------------------------------ */
/* Reporting                                                            */
/* ------------------------------------------------------------------ */

export async function getFinancialOverview() {
  const commissions = await sweepOverdue(await commissionRepository.findAll());
  const sum = (items, fn) => round2(items.reduce((acc, i) => acc + fn(i), 0));

  const due = commissions.filter((c) => c.status === COMMISSION_STATUS.DUE);
  const overdue = commissions.filter((c) => c.status === COMMISSION_STATUS.OVERDUE);
  const underReview = commissions.filter((c) => c.status === COMMISSION_STATUS.UNDER_REVIEW);
  const paid = commissions.filter((c) => c.status === COMMISSION_STATUS.PAID);
  const disputed = commissions.filter((c) => c.status === COMMISSION_STATUS.DISPUTED);
  const waived = commissions.filter((c) => c.status === COMMISSION_STATUS.WAIVED);

  const byProvider = new Map();
  for (const c of commissions) {
    const entry = byProvider.get(c.providerId) || { providerId: c.providerId, providerName: c.providerName, totalCommissionGBP: 0, paidGBP: 0, outstandingGBP: 0 };
    entry.totalCommissionGBP = round2(entry.totalCommissionGBP + c.commissionAmountGBP);
    entry.paidGBP = round2(entry.paidGBP + c.paidAmountGBP);
    entry.outstandingGBP = round2(entry.outstandingGBP + c.remainingAmountGBP);
    byProvider.set(c.providerId, entry);
  }
  const topProviders = [...byProvider.values()].sort((a, b) => b.totalCommissionGBP - a.totalCommissionGBP).slice(0, 10);

  return {
    totals: {
      totalCommissionGBP: sum(commissions, (c) => c.commissionAmountGBP),
      totalCollectedGBP: sum(commissions, (c) => c.paidAmountGBP),
      totalOutstandingGBP: sum(commissions, (c) => c.remainingAmountGBP),
      dueCount: due.length,
      overdueCount: overdue.length,
      underReviewCount: underReview.length,
      paidCount: paid.length,
      disputedCount: disputed.length,
      waivedCount: waived.length,
    },
    topProviders,
  };
}

