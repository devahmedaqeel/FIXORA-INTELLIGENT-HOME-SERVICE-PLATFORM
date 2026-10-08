import { WEEKDAYS } from '../constants/index.js';

/*
 * All booking dates/times are stored as local UK clock-time strings:
 *   bookingDate "YYYY-MM-DD", startTime/endTime "HH:mm".
 * Unlike Pakistan Standard Time, the UK observes daylight saving (GMT in winter, BST
 * in summer), so the UTC offset must be computed per-date rather than treated as fixed.
 * The clock is injectable so tests can travel in time.
 */

let clockOverride = null;

export const now = () => (clockOverride ? new Date(clockOverride.getTime()) : new Date());
export const nowIso = () => now().toISOString();
export const setClock = (date) => {
  clockOverride = date ? new Date(date) : null;
};

/** Midnight UTC on the last Sunday of `month` (0-indexed) in `year`. */
function lastSundayUtc(year, month) {
  const d = new Date(Date.UTC(year, month + 1, 0)); // last day of the month
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d;
}

/** British Summer Time: last Sunday in March 01:00 UTC to last Sunday in October 01:00 UTC. */
function isBst(date) {
  const year = date.getUTCFullYear();
  const start = lastSundayUtc(year, 2);
  start.setUTCHours(1, 0, 0, 0);
  const end = lastSundayUtc(year, 9);
  end.setUTCHours(1, 0, 0, 0);
  return date >= start && date < end;
}

/** UK local UTC offset in minutes (0 for GMT, 60 for BST) for a given instant. */
export const ukOffsetMinutes = (date = now()) => (isBst(date) ? 60 : 0);

/** UK local UTC offset for a given "YYYY-MM-DD" local date (probed at midday to dodge the transition instant). */
const offsetMinutesForLocalDate = (dateStr) => ukOffsetMinutes(new Date(`${dateStr}T12:00:00Z`));

const offsetString = (minutes) => (minutes === 60 ? '+01:00' : '+00:00');

export const timeToMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Half-open interval overlap: [aStart, aEnd) vs [bStart, bEnd). */
export const rangesOverlap = (aStart, aEnd, bStart, bEnd) =>
  timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd);

/** Converts a local UK date + time to an absolute Date, honouring GMT/BST for that date. */
export const toInstant = (date, time) => new Date(`${date}T${time}:00${offsetString(offsetMinutesForLocalDate(date))}`);

/** Today's date in UK local time as YYYY-MM-DD. */
export const todayLocal = () => {
  const shifted = new Date(now().getTime() + ukOffsetMinutes(now()) * 60000);
  return shifted.toISOString().slice(0, 10);
};

/** Minutes since midnight UK local time right now. */
export const nowLocalMinutes = () => {
  const shifted = new Date(now().getTime() + ukOffsetMinutes(now()) * 60000);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
};

export const weekdayOf = (date) => WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];

export const addDays = (date, days) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const diffDays = (from, to) =>
  Math.round((new Date(`${to}T12:00:00Z`) - new Date(`${from}T12:00:00Z`)) / 86400000);

/** "YYYY-MM" for the given ISO timestamp, in UK local time. */
export const monthKey = (iso) => {
  const instant = new Date(iso);
  return new Date(instant.getTime() + ukOffsetMinutes(instant) * 60000).toISOString().slice(0, 7);
};

/** Last n month keys ending with the current month, oldest first. */
export const lastMonthKeys = (n) => {
  const base = new Date(now().getTime() + ukOffsetMinutes(now()) * 60000);
  const keys = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() - i, 1));
    keys.push(d.toISOString().slice(0, 7));
  }
  return keys;
};
