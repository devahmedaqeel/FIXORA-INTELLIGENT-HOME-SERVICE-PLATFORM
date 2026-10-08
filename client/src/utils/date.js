/** Date helpers in Pakistan time (UTC+5, no DST) so the calendar matches the server. */

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

export const todayPk = () => new Date(Date.now() + PKT_OFFSET_MS).toISOString().slice(0, 10);

export const addDays = (isoDate, days) => {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const weekdayKey = (isoDate) =>
  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(`${isoDate}T12:00:00Z`).getUTCDay()];

export const nextDays = (count, start = todayPk()) => Array.from({ length: count }, (_, i) => addDays(start, i));

/** Minutes from now until a PKT date/time (negative if in the past). */
export const minutesUntil = (isoDate, hhmm) => Math.round((new Date(`${isoDate}T${hhmm}:00+05:00`).getTime() - Date.now()) / 60000);
