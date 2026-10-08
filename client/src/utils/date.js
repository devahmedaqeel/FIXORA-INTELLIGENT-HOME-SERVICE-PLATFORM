/** Date helpers in UK local time (GMT/BST-aware via the browser's Europe/London timezone data) so the calendar matches the server. */

/** UK UTC offset in minutes at a given instant (0 for GMT, 60 for BST), via the browser's own timezone database. */
function ukOffsetMinutesAt(date) {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const ukStr = date.toLocaleString('en-US', { timeZone: 'Europe/London' });
  return Math.round((new Date(ukStr) - new Date(utcStr)) / 60000);
}

export const todayUk = () => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
};

export const addDays = (isoDate, days) => {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const weekdayKey = (isoDate) =>
  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(`${isoDate}T12:00:00Z`).getUTCDay()];

export const nextDays = (count, start = todayUk()) => Array.from({ length: count }, (_, i) => addDays(start, i));

/** Minutes from now until a UK local date/time (negative if in the past). */
export const minutesUntil = (isoDate, hhmm) => {
  const offsetMinutes = ukOffsetMinutesAt(new Date(`${isoDate}T12:00:00Z`));
  const offset = offsetMinutes === 60 ? '+01:00' : '+00:00';
  return Math.round((new Date(`${isoDate}T${hhmm}:00${offset}`).getTime() - Date.now()) / 60000);
};
