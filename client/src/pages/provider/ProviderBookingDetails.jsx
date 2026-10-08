import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BookingDetailsView from '../../components/booking/BookingDetailsView';
import MessageThread from '../../components/booking/MessageThread';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { getBooking, updateBookingStatus, updatePaymentStatus } from '../../features/booking/booking.service';
import { PROVIDER_ACTIONS } from '../../features/booking/booking.constants';
import { PAYMENT_STATUS_LABELS } from '../../constants';
import { todayUk } from '../../utils/date';

export default function ProviderBookingDetails() {
  useDocumentTitle('Booking details');
  const { id } = useParams();
  const toast = useToast();
  const { data: booking, loading, error, reload, setData } = useAsync(() => getBooking(id), [id]);
  const [notes, setNotes] = useState(null);
  const [pending, setPending] = useState(null); // action awaiting confirmation
  const [busy, setBusy] = useState(false);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  const providerNotes = notes ?? booking.providerNotes ?? '';
  const actions = (PROVIDER_ACTIONS[booking.status] || []).filter((a) => a.status !== 'completed' || booking.bookingDate <= todayUk());

  const run = async (action) => {
    setBusy(true);
    try {
      const updated = await updateBookingStatus(booking.id, { status: action.status, providerNotes });
      setData(updated);
      toast.success(`Booking ${action.label.toLowerCase().replace('mark ', 'marked ')}`);
      setPending(null);
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  };

  const changePayment = async (paymentStatus) => {
    try {
      setData(await updatePaymentStatus(booking.id, paymentStatus));
      toast.success('Payment status updated');
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader
        title="Booking details"
        actions={
          <Button to="/provider/bookings" variant="ghost" icon="chevron-left">
            All bookings
          </Button>
        }
      />
      <BookingDetailsView booking={booking} perspective="provider" />

      <MessageThread bookingId={booking.id} counterpartName={booking.customerName} />

      {(actions.length > 0 || booking.status === 'completed') && (
        <section className="card stack">
          <h2 className="card__title">Manage booking</h2>
          {actions.length > 0 && (
            <>
              <Input as="textarea" rows={3} label="Notes for the customer (optional)" value={providerNotes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
              <div className="row row--wrap">
                {actions.map((action) => (
                  <Button key={action.status} variant={action.variant} loading={busy && pending?.status === action.status} onClick={() => (action.confirm ? setPending(action) : run(action))}>
                    {action.label}
                  </Button>
                ))}
              </div>
              {booking.status === 'confirmed' && booking.bookingDate > todayUk() && <p className="muted small">You can mark the job completed on or after the booking date.</p>}
            </>
          )}
          {['confirmed', 'in_progress', 'completed'].includes(booking.status) && (
            <Select
              label="Payment status"
              value={booking.paymentStatus}
              onChange={(e) => changePayment(e.target.value)}
              options={Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
              className="narrow-field"
            />
          )}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.label}
        message={pending?.confirm}
        confirmLabel={pending?.label}
        loading={busy}
        onConfirm={() => run(pending)}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
