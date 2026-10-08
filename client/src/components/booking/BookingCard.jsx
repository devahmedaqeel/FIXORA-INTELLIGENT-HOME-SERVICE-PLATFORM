import { Link } from 'react-router-dom';
import BookingStatusBadge from './BookingStatusBadge';
import Icon from '../common/Icon';
import { formatDate, formatPrice, formatTimeRange } from '../../utils/format';

/**
 * Compact booking summary. perspective="customer" shows the provider; "provider" shows the customer.
 */
export default function BookingCard({ booking, perspective = 'customer', to, actions }) {
  const counterpart = perspective === 'provider' ? booking.customerName : booking.providerName;
  return (
    <article className="booking-card">
      <div className="booking-card__date" aria-hidden="true">
        <span className="booking-card__day">{booking.bookingDate.slice(8, 10)}</span>
        <span className="booking-card__month">{formatDate(booking.bookingDate, { month: 'short' })}</span>
      </div>
      <div className="booking-card__body">
        <div className="row row--between row--wrap">
          <h3 className="booking-card__title">{to ? <Link to={to}>{booking.serviceTitle}</Link> : booking.serviceTitle}</h3>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="booking-card__meta">
          <Icon name={perspective === 'provider' ? 'user' : 'briefcase'} size={15} />
          {counterpart}
        </p>
        <p className="booking-card__meta">
          <Icon name="calendar" size={15} />
          {formatDate(booking.bookingDate)} · {formatTimeRange(booking.startTime, booking.endTime)}
        </p>
        {booking.areaName && (
          <p className="booking-card__meta">
            <Icon name="map-pin" size={15} />
            {booking.areaName}
          </p>
        )}
        <div className="row row--between row--wrap booking-card__footer">
          <strong>{formatPrice(booking.price, booking.pricingType)}</strong>
          {actions && <div className="row">{actions}</div>}
        </div>
      </div>
    </article>
  );
}
