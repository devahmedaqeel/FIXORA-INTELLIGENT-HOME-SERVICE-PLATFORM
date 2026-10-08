import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Icon from '../common/Icon';
import { cancelBooking, getCancellationPreview } from '../../features/booking/booking.service';

/**
 * Asks the server whether cancellation is free, late (warning/fee) or blocked under the
 * admin-configured policy, and requires explicit acknowledgement for late cancellations.
 */
export default function CancelBookingDialog({ bookingId, open, onClose, onCancelled }) {
  const [preview, setPreview] = useState({ loading: true, data: null, error: null });
  const [reason, setReason] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setReason('');
    setAcknowledged(false);
    setError(null);
    setPreview({ loading: true, data: null, error: null });
    getCancellationPreview(bookingId)
      .then((data) => setPreview({ loading: false, data, error: null }))
      .catch((err) => setPreview({ loading: false, data: null, error: err }));
  }, [open, bookingId]);

  const decision = preview.data;
  const needsAck = decision?.isLate && decision?.canCancel;

  const confirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await cancelBooking(bookingId, { reason, acknowledgeLateCancellation: acknowledged });
      onCancelled?.(updated);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel booking"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Keep booking
          </Button>
          <Button variant="danger" onClick={confirm} loading={submitting} disabled={!decision?.canCancel || (needsAck && !acknowledged)}>
            Cancel booking
          </Button>
        </>
      }
    >
      {preview.loading && <Loader label="Checking cancellation policy…" />}
      <ErrorMessage error={preview.error} compact />
      {decision && (
        <div className="stack">
          <div className={`notice ${decision.isLate ? 'notice--warning' : 'notice--info'}`}>
            <Icon name={decision.isLate ? 'alert' : 'info'} size={18} />
            <p>{decision.message}</p>
          </div>
          {decision.canCancel && (
            <>
              <Input as="textarea" rows={3} label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />
              {needsAck && (
                <label className="checkbox">
                  <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
                  <span>I understand this is a late cancellation{decision.fee > 0 ? ` and a fee of Rs ${decision.fee} applies` : ''}.</span>
                </label>
              )}
            </>
          )}
          <ErrorMessage error={error} compact />
        </div>
      )}
    </Modal>
  );
}
