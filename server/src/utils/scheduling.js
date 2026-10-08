import { ACTIVE_BOOKING_STATUSES } from '../constants/index.js';
import { minutesToTime, rangesOverlap, timeToMinutes, weekdayOf } from './time.js';

/*
 * Pure scheduling rules shared by slot listing and booking creation, so the slots a
 * customer sees and the final server-side validation can never disagree.
 */

/** Minimum notice before a slot can be booked. */
export const MIN_LEAD_MINUTES = 60;

export function getDaySchedule(availability, date) {
  if (!availability?.weekly) return { enabled: false, reason: 'The provider has not set availability yet' };
  const exception = (availability.exceptions || []).find((e) => e.date === date);
  if (exception) return { enabled: false, reason: exception.reason || 'The provider is unavailable on this date' };
  const day = availability.weekly[weekdayOf(date)];
  if (!day?.enabled) return { enabled: false, reason: 'The provider does not work on this day' };
  return { enabled: true, start: day.start, end: day.end };
}

/** Returns the first active booking overlapping [startTime, endTime), honouring a buffer. */
export function findConflict(existingBookings, startTime, endTime, bufferMinutes = 0, excludeBookingId = null) {
  const pad = (t, delta) => minutesToTime(Math.min(Math.max(timeToMinutes(t) + delta, 0), 24 * 60 - 1));
  return (
    existingBookings.find(
      (b) =>
        b.id !== excludeBookingId &&
        ACTIVE_BOOKING_STATUSES.includes(b.status) &&
        rangesOverlap(startTime, pad(endTime, bufferMinutes), b.startTime, pad(b.endTime, bufferMinutes)),
    ) || null
  );
}

/**
 * Validates one candidate slot.
 * @returns {{ ok: true, endTime } | { ok: false, code, reason }}
 */
export function evaluateSlot({ availability, date, startTime, duration, existingBookings, today, nowMinutes, bufferMinutes = 0 }) {
  if (date < today) return { ok: false, code: 'PAST_DATE', reason: 'You cannot book a date in the past' };

  const schedule = getDaySchedule(availability, date);
  if (!schedule.enabled) return { ok: false, code: 'DAY_UNAVAILABLE', reason: schedule.reason };

  const start = timeToMinutes(startTime);
  const end = start + duration;
  if (end > 24 * 60) return { ok: false, code: 'OUTSIDE_HOURS', reason: 'The service would run past midnight' };
  if (start < timeToMinutes(schedule.start) || end > timeToMinutes(schedule.end)) {
    return {
      ok: false,
      code: 'OUTSIDE_HOURS',
      reason: `Choose a time between ${schedule.start} and ${schedule.end} that fits the ${duration}-minute service`,
    };
  }
  if (date === today && start < nowMinutes + MIN_LEAD_MINUTES) {
    return { ok: false, code: 'TOO_SOON', reason: `Bookings need at least ${MIN_LEAD_MINUTES} minutes notice` };
  }

  const endTime = minutesToTime(end);
  const conflict = findConflict(existingBookings, startTime, endTime, bufferMinutes);
  if (conflict) return { ok: false, code: 'CONFLICT', reason: 'This time slot has just been booked. Please choose another time.' };

  return { ok: true, endTime };
}

/** Lists every bookable start time on a date. */
export function generateSlots({ availability, date, duration, existingBookings, today, nowMinutes, intervalMinutes, bufferMinutes = 0 }) {
  const schedule = getDaySchedule(availability, date);
  if (date < today) return { available: false, reason: 'This date is in the past', slots: [] };
  if (!schedule.enabled) return { available: false, reason: schedule.reason, slots: [] };

  const slots = [];
  const dayEnd = timeToMinutes(schedule.end);
  for (let t = timeToMinutes(schedule.start); t + duration <= dayEnd; t += intervalMinutes) {
    const startTime = minutesToTime(t);
    const result = evaluateSlot({ availability, date, startTime, duration, existingBookings, today, nowMinutes, bufferMinutes });
    if (result.ok) slots.push({ startTime, endTime: result.endTime });
  }
  return {
    available: slots.length > 0,
    reason: slots.length ? '' : 'No free time slots left on this date',
    slots,
    workingHours: { start: schedule.start, end: schedule.end },
  };
}
