import { BOOKING_STATUS } from '../constants/index.js';
import { now, toInstant } from '../utils/time.js';

/*
 * Cancellation policy (BR-6) in one place. The cutoff and late behaviour come from
 * admin-editable settings (bookingCancellationCutoffMinutes, lateCancellationPolicy,
 * lateCancellationFeePercent) — nothing here is hardcoded per call-site.
 */

export const CANCELLABLE_STATUSES = [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED];

export function evaluateCancellation(booking, settings) {
  const cutoffMinutes = settings.bookingCancellationCutoffMinutes;
  const policy = settings.lateCancellationPolicy;
  const minutesUntilStart = Math.floor((toInstant(booking.bookingDate, booking.startTime) - now()) / 60000);

  if (!CANCELLABLE_STATUSES.includes(booking.status)) {
    return { canCancel: false, isLate: false, cutoffMinutes, policy, fee: 0, minutesUntilStart, message: `A ${booking.status.replace('_', ' ')} booking cannot be cancelled.` };
  }
  if (minutesUntilStart <= 0) {
    return { canCancel: false, isLate: true, cutoffMinutes, policy, fee: 0, minutesUntilStart, message: 'This booking has already started and can no longer be cancelled.' };
  }

  const isLate = minutesUntilStart < cutoffMinutes;
  if (!isLate) {
    return { canCancel: true, isLate: false, cutoffMinutes, policy, fee: 0, minutesUntilStart, message: 'You can cancel this booking free of charge.' };
  }

  const hours = Math.round((cutoffMinutes / 60) * 10) / 10;
  if (policy === 'block') {
    return { canCancel: false, isLate: true, cutoffMinutes, policy, fee: 0, minutesUntilStart, message: `Bookings cannot be cancelled within ${hours} hour(s) of the start time. Please contact the provider or support.` };
  }

  const fee = policy === 'fee' ? Math.round(((Number(booking.price) || 0) * settings.lateCancellationFeePercent) / 100) : 0;
  return {
    canCancel: true,
    isLate: true,
    cutoffMinutes,
    policy,
    fee,
    minutesUntilStart,
    message:
      fee > 0
        ? `This is a late cancellation (less than ${hours} hour(s) before the start). A cancellation fee of £${fee} applies.`
        : `This is a late cancellation (less than ${hours} hour(s) before the start). Frequent late cancellations may affect your account.`,
  };
}
