import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import BookingDetailsView from '../../components/booking/BookingDetailsView';
import MessageThread from '../../components/booking/MessageThread';
import CancelBookingDialog from '../../components/booking/CancelBookingDialog';
import ReviewForm from '../../components/reviews/ReviewForm';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { getBooking } from '../../features/booking/booking.service';
import { canCustomerCancel, canReview } from '../../features/booking/booking.utils';

export default function BookingDetails() {
  useDocumentTitle('Booking details');
  const { id } = useParams();
  const toast = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const { data: booking, loading, error, reload, setData } = useAsync(() => getBooking(id), [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  return (
    <div className="stack stack--lg">
      <PageHeader
        title="Booking details"
        actions={
          <Button to="/customer/bookings" variant="ghost" icon="chevron-left">
            All bookings
          </Button>
        }
      />
      <BookingDetailsView
        booking={booking}
        perspective="customer"
        actions={
          <>
            <Button to={`/customer/providers/${booking.providerId}`} variant="secondary" size="sm">
              View provider
            </Button>
            {canCustomerCancel(booking) && (
              <Button variant="danger" size="sm" icon="x" onClick={() => setCancelOpen(true)}>
                Cancel booking
              </Button>
            )}
            {['completed', 'cancelled'].includes(booking.status) && (
              <Button to={`/customer/book/${booking.providerId}?serviceId=${booking.serviceId}`} size="sm" variant="secondary" icon="refresh">
                Book again
              </Button>
            )}
            <Link to={`/customer/complaints?bookingId=${booking.id}`} className="small">
              Report a problem
            </Link>
          </>
        }
      />

      <MessageThread bookingId={booking.id} counterpartName={booking.providerName} />

      {canReview(booking) && (
        <section id="review" className="card">
          <h2 className="card__title">How was your experience with {booking.providerName}?</h2>
          <ReviewForm
            bookingId={booking.id}
            onSaved={() => {
              toast.success('Thanks for your review!');
              setData((b) => ({ ...b, reviewed: true }));
            }}
          />
        </section>
      )}
      {booking.reviewed && <p className="muted">You reviewed this booking. You can edit it from Reviews.</p>}

      <CancelBookingDialog
        bookingId={booking.id}
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onCancelled={(updated) => {
          setCancelOpen(false);
          setData(updated);
          toast.success('Booking cancelled');
        }}
      />
    </div>
  );
}
