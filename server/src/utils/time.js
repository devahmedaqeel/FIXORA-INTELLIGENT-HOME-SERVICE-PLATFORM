import { PLATFORM_UTC_OFFSET, PLATFORM_UTC_OFFSET_MINUTES, WEEKDAYS } from '../constants/index.js';

/*
 * All booking dates/times are stored as local Pakistan time strings:
 *   bookingDate "YYYY-MM-DD", startTime/endTime "HH:mm".
 * The clock is injectable so tests can travel in time.
 */

let clockOverride = null;

export const now = () => (clockOverride ? new Date(clockOverride.getTime()) : new Date());
export const nowIso = () => now().toISOString();
export const setClock = (date) => {
  clockOverride = date ? new Date(date) : null;
};

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

/** Converts a local PKT date + time to an absolute Date. */
export const toInstant = (date, time) => new Date(`${date}T${time}:00${PLATFORM_UTC_OFFSET}`);

/** Today's date in PKT as YYYY-MM-DD. */
export const todayLocal = () => {
  const shifted = new Date(now().getTime() + PLATFORM_UTC_OFFSET_MINUTES * 60000);
  return shifted.toISOString().slice(0, 10);
};

/** Minutes since midnight PKT right now. */
export const nowLocalMinutes = () => {
  const shifted = new Date(now().getTime() + PLATFORM_UTC_OFFSET_MINUTES * 60000);
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

/** "YYYY-MM" for the given ISO timestamp, in PKT. */
export const monthKey = (iso) =>
  new Date(new Date(iso).getTime() + PLATFORM_UTC_OFFSET_MINUTES * 60000).toISOString().slice(0, 7);

/** Last n month keys ending with the current month, oldest first. */
export const lastMonthKeys = (n) => {
  const base = new Date(now().getTime() + PLATFORM_UTC_OFFSET_MINUTES * 60000);
  const keys = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() - i, 1));
    keys.push(d.toISOString().slice(0, 7));
  }
  return keys;
};
