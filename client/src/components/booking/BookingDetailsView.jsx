import BookingStatusBadge from './BookingStatusBadge';
import Icon from '../common/Icon';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../constants';
import { formatDate, formatDateTime, formatDuration, formatPrice, formatTimeRange } from '../../utils/format';

/** Booking information + status timeline, shared by customer, provider and admin views. */
export default function BookingDetailsView({ booking, perspective = 'customer', actions }) {
  const counterpartLabel = perspective === 'provider' ? 'Customer' : 'Provider';
  const counterpart = perspective === 'provider' ? booking.customerName : booking.providerName;

  return (
    <div className="details-layout">
      <section className="card stack">
        <div className="row row--between row--wrap">
          <div>
            <p className="eyebrow">{booking.categoryName}</p>
            <h2 className="details-title">{booking.serviceTitle}</h2>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <dl className="details-grid">
          <div>
            <dt>
              <Icon name="calendar" size={16} /> Date
            </dt>
            <dd>{formatDate(booking.bookingDate)}</dd>
          </div>
          <div>
            <dt>
              <Icon name="clock" size={16} /> Time
            </dt>
            <dd>
              {formatTimeRange(booking.startTime, booking.endTime)} <span className="muted">({formatDuration(booking.duration)})</span>
            </dd>
          </div>
          <div>
            <dt>
              <Icon name="user" size={16} /> {counterpartLabel}
            </dt>
            <dd>{counterpart}</dd>
          </div>
          {perspective !== 'customer' && booking.customerPhone && (
            <div>
              <dt>
                <Icon name="phone" size={16} /> Customer phone
              </dt>
              <dd>
                <a href={`tel:${booking.customerPhone}`}>{booking.customerPhone}</a>
              </dd>
            </div>
          )}
          <div>
            <dt>
              <Icon name="wallet" size={16} /> Price
            </dt>
            <dd>
              {formatPrice(booking.price, booking.pricingType)} · <span className="muted">{PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus}</span>
            </dd>
          </div>
          <div className="details-grid__wide">
            <dt>
              <Icon name="map-pin" size={16} /> Address
            </dt>
            <dd>
              {booking.customerAddress}
              {booking.areaName && <span className="muted"> · {booking.areaName}</span>}
            </dd>
          </div>
          {booking.customerNotes && (
            <div className="details-grid__wide">
              <dt>Customer notes</dt>
              <dd className="prewrap">{booking.customerNotes}</dd>
            </div>
          )}
          {booking.providerNotes && (
            <div className="details-grid__wide">
              <dt>Provider notes</dt>
              <dd className="prewrap">{booking.providerNotes}</dd>
            </div>
          )}
          {booking.status === 'cancelled' && (
            <div className="details-grid__wide">
              <dt>Cancellation</dt>
              <dd>
                Cancelled by {booking.cancelledBy || 'unknown'}
                {booking.cancellationReason && ` — “${booking.cancellationReason}”`}
                {booking.lateCancellation && <span className="muted"> (late cancellation{booking.cancellationFee ? `, fee £${booking.cancellationFee}` : ''})</span>}
              </dd>
            </div>
          )}
        </dl>
        {actions && <div className="row row--wrap details-actions">{actions}</div>}
      </section>

      <aside className="card">
        <h2 className="card__title">Timeline</h2>
        <ol className="timeline">
          {(booking.statusHistory || []).map((entry, index) => (
            <li key={`${entry.status}-${index}`} className="timeline__item">
              <span className="timeline__dot" aria-hidden="true" />
              <div>
                <p className="timeline__status">{BOOKING_STATUS_LABELS[entry.status] || entry.status}</p>
                <p className="muted small">{formatDateTime(entry.at)}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="muted small">Booking reference: {booking.id}</p>
      </aside>
    </div>
  );
}
