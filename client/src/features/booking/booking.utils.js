import { minutesUntil, todayUk } from '../../utils/date';
import { ACTIVE_STATUSES } from './booking.constants';

export const isUpcoming = (booking) => ACTIVE_STATUSES.includes(booking.status) && booking.bookingDate >= todayUk();

/** UI hint only — the server decides via /cancellation-preview using admin settings. */
export const canCustomerCancel = (booking) =>
  ['pending', 'confirmed'].includes(booking.status) && minutesUntil(booking.bookingDate, booking.startTime) > 0;

export const canReview = (booking) => booking.status === 'completed' && !booking.reviewed;

export const sortChronologically = (bookings) =>
  [...bookings].sort((a, b) => `${a.bookingDate}${a.startTime}`.localeCompare(`${b.bookingDate}${b.startTime}`));

/** Where "Book now" should go: the booking page for customers, sign-in for guests. */
export function bookingPathFor(user, providerId, serviceId) {
  const target = `/customer/book/${providerId}${serviceId ? `?serviceId=${serviceId}` : ''}`;
  if (!user) return `/login?redirect=${encodeURIComponent(target)}`;
  return user.role === 'customer' ? target : null;
}
