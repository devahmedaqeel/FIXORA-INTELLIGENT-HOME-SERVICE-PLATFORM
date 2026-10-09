import { useState } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';
import Icon from '../common/Icon';
import ErrorMessage from '../common/ErrorMessage';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { PAYMENT_METHOD_OPTIONS, PAYMENT_CONFIRMATION_LABELS } from '../../constants';
import { formatPrice } from '../../utils/format';
import {
  getBookingPayment,
  confirmPaymentAsCustomer,
  confirmPaymentAsProvider,
  disputeBookingPayment,
} from '../../features/booking/booking.service';

const loadPayment = async (bookingId) => {
  try {
    return await getBookingPayment(bookingId);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
};

/**
 * Shown on a completed booking for both customer and provider. Each side confirms the
 * payment independently; once both have confirmed, the record is "paid" and a commission
 * is generated automatically on the provider's side — nothing here can set that directly.
 */
export default function PaymentConfirmationCard({ booking, perspective }) {
  const toast = useToast();
  const { data: payment, loading, error, setData } = useAsync(() => loadPayment(booking.id), [booking.id]);
  const [method, setMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [disputing, setDisputing] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  if (booking.status !== 'completed') return null;
  if (loading) return null;
  if (error) return <ErrorMessage error={error} compact />;

  const myConfirmed = perspective === 'customer' ? payment?.customerConfirmed : payment?.providerConfirmed;
  const theirConfirmed = perspective === 'customer' ? payment?.providerConfirmed : payment?.customerConfirmed;
  const theirLabel = perspective === 'customer' ? 'Provider' : 'Customer';
  const isSettled = ['paid', 'disputed', 'refunded'].includes(payment?.status);

  const confirm = async () => {
    setBusy(true);
    try {
      const confirmFn = perspective === 'customer' ? confirmPaymentAsCustomer : confirmPaymentAsProvider;
      const updated = await confirmFn(booking.id, { method, reference });
      setData(updated);
      toast.success(perspective === 'customer' ? 'Payment confirmed' : 'Payment receipt confirmed');
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  };

  const submitDispute = async () => {
    if (reason.trim().length < 10) {
      toast.error('Please describe the problem in at least 10 characters');
      return;
    }
    setBusy(true);
    try {
      const updated = await disputeBookingPayment(booking.id, reason.trim());
      setData(updated);
      setDisputing(false);
      toast.success('Payment dispute submitted — our team will review it');
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card stack">
      <h2 className="card__title">Payment</h2>
      <p className="muted">
        Amount: <strong>{formatPrice(booking.price, booking.pricingType)}</strong>
        {payment && (
          <>
            {' '}
            · <Badge tone={payment.status === 'paid' ? 'success' : payment.status === 'disputed' ? 'danger' : 'warning'}>
              {PAYMENT_CONFIRMATION_LABELS[payment.status] || payment.status}
            </Badge>
          </>
        )}
      </p>

      <div className="row row--wrap">
        <span className={`notice notice--${myConfirmed ? 'success' : 'info'}`} style={{ flex: '1 1 200px' }}>
          <Icon name={myConfirmed ? 'check-circle' : 'info'} size={16} />
          <span>You {myConfirmed ? 'confirmed this payment' : 'have not confirmed this payment yet'}</span>
        </span>
        <span className={`notice notice--${theirConfirmed ? 'success' : 'info'}`} style={{ flex: '1 1 200px' }}>
          <Icon name={theirConfirmed ? 'check-circle' : 'info'} size={16} />
          <span>
            {theirLabel} {theirConfirmed ? 'confirmed this payment' : 'has not confirmed yet'}
          </span>
        </span>
      </div>

      {!myConfirmed && !isSettled && (
        <div className="row row--wrap row--end">
          <Select
            label="Payment method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            options={PAYMENT_METHOD_OPTIONS}
            className="narrow-field"
          />
          <Input label="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} />
          <Button onClick={confirm} loading={busy} icon="check">
            {perspective === 'customer' ? 'Confirm I paid' : 'Confirm I received payment'}
          </Button>
        </div>
      )}

      {!isSettled && (
        <div>
          {!disputing ? (
            <button type="button" className="btn-link small" onClick={() => setDisputing(true)}>
              Something wrong with this payment?
            </button>
          ) : (
            <div className="stack">
              <Input as="textarea" rows={3} label="What went wrong?" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} />
              <div className="row row--end">
                <Button variant="ghost" size="sm" onClick={() => setDisputing(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" loading={busy} onClick={submitDispute}>
                  Report problem
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
