import { BOOKING_STATUS_LABELS, PRICING_TYPES } from '../constants';

const gbpFormatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

export const formatGBP = (amount) => gbpFormatter.format(Number(amount) || 0);

export function formatPrice(price, pricingType) {
  const value = formatGBP(price);
  if (pricingType === 'starting_from') return `From ${value}`;
  if (pricingType === 'hourly') return `${value}/hr`;
  return value;
}

export const pricingLabel = (type) => PRICING_TYPES.find((p) => p.value === type)?.label || type;

/** "2030-01-08" → "Tue, 8 Jan 2030" (parsed as a calendar date, no timezone drift). */
export function formatDate(isoDate, options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
}

/** "14:30" → "2:30 PM" */
export function formatTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
}

export const formatTimeRange = (start, end) => `${formatTime(start)} – ${formatTime(end)}`;

export function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Europe/London' });
}

export function timeAgo(iso) {
  if (!iso) return '';
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return `${value} ${unit}${value > 1 ? 's' : ''} ago`;
  }
  return '';
}

export const formatMonth = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
};

export const statusLabel = (status) => BOOKING_STATUS_LABELS[status] || status;

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

export const formatDuration = (minutes) => {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h} hr` : '', m ? `${m} min` : ''].filter(Boolean).join(' ');
};
