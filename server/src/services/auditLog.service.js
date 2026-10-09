import { auditLogRepository } from '../repositories/index.js';
import { paginate } from '../utils/http.js';
import { nowIso } from '../utils/time.js';

/*
 * Immutable financial audit trail. Every payment/commission state transition writes one
 * entry here — admins can read it, nobody (including admins, through the client SDK) can
 * edit or delete it. Failures are logged by the caller's own try/catch if they care; a
 * missing audit entry must never block the underlying financial transition from completing,
 * so this never throws.
 */
export async function record({ action, actorId, actorRole, actorName = '', bookingId = '', commissionId = '', amountGBP = null, details = '' }) {
  try {
    return await auditLogRepository.create({
      action,
      actorId,
      actorRole,
      actorName,
      bookingId,
      commissionId,
      amountGBP,
      details,
      createdAt: nowIso(),
    });
  } catch {
    return null;
  }
}

export async function listAll({ action, bookingId, commissionId, actorId, page, limit } = {}) {
  let logs = await auditLogRepository.findRecent(2000);
  if (action) logs = logs.filter((l) => l.action === action);
  if (bookingId) logs = logs.filter((l) => l.bookingId === bookingId);
  if (commissionId) logs = logs.filter((l) => l.commissionId === commissionId);
  if (actorId) logs = logs.filter((l) => l.actorId === actorId);
  return paginate(logs, { page, limit });
}

export const timelineForCommission = (commissionId) => auditLogRepository.findByCommission(commissionId);
export const timelineForBooking = (bookingId) => auditLogRepository.findByBooking(bookingId);
