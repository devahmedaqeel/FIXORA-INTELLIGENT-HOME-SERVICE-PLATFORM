import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Badge from '../common/Badge';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { createComplaint, listMyComplaints } from '../../services/account.service';
import { listMyBookings } from '../../features/booking/booking.service';
import { COMPLAINT_STATUS_LABELS, COMPLAINT_TYPES } from '../../constants';
import { formatDate, formatDateTime } from '../../utils/format';
import { fieldErrorsFromApi } from '../../utils/validation';

const STATUS_TONES = { open: 'warning', in_review: 'info', resolved: 'success', rejected: 'neutral' };

/** List + submit complaints (customers and providers). ?bookingId= pre-fills a booking complaint. */
export default function ComplaintsPanel() {
  const toast = useToast();
  const [params] = useSearchParams();
  const prefillBooking = params.get('bookingId') || '';
  const [open, setOpen] = useState(Boolean(prefillBooking));
  const [form, setForm] = useState({ type: prefillBooking ? 'booking' : 'platform', bookingId: prefillBooking, subject: '', description: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const complaints = useAsync(() => listMyComplaints({ limit: 50 }), []);
  const bookings = useAsync(() => listMyBookings({ limit: 100 }), []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (form.subject.trim().length < 5) next.subject = 'Subject must be at least 5 characters';
    if (form.description.trim().length < 20) next.description = 'Please describe the issue in at least 20 characters';
    if (form.type === 'booking' && !form.bookingId) next.bookingId = 'Select the booking';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await createComplaint({
        type: form.type,
        subject: form.subject.trim(),
        description: form.description.trim(),
        ...(form.bookingId && ['booking', 'payment', 'provider'].includes(form.type) ? { bookingId: form.bookingId } : {}),
      });
      toast.success('Complaint submitted. Our team will get back to you.');
      setOpen(false);
      setForm({ type: 'platform', bookingId: '', subject: '', description: '' });
      complaints.reload();
    } catch (err) {
      setErrors(fieldErrorsFromApi(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  const bookingOptions = (bookings.data?.items || []).map((b) => ({
    value: b.id,
    label: `${b.serviceTitle} · ${formatDate(b.bookingDate)} · ${b.providerName || b.customerName}`,
  }));

  return (
    <>
      <PageHeader
        title="Complaints & support"
        description="Report a problem with a booking, provider, payment or the platform."
        actions={<Button icon="plus" onClick={() => setOpen(true)}>New complaint</Button>}
      />
      {complaints.loading && <Loader />}
      <ErrorMessage error={complaints.error} onRetry={complaints.reload} />
      {complaints.data?.items.length === 0 && <EmptyState icon="alert" title="No complaints submitted." message="We hope it stays that way!" />}
      <div className="stack">
        {complaints.data?.items.map((c) => (
          <article key={c.id} className="card">
            <div className="row row--between row--wrap">
              <h2 className="card__title">{c.subject}</h2>
              <Badge tone={STATUS_TONES[c.status]}>{COMPLAINT_STATUS_LABELS[c.status]}</Badge>
            </div>
            <p className="muted small">
              {COMPLAINT_TYPES.find((t) => t.value === c.type)?.label} · {formatDateTime(c.createdAt)}
              {c.bookingSummary && ` · ${c.bookingSummary}`}
            </p>
            <p className="prewrap">{c.description}</p>
            {c.adminResponse && (
              <div className="notice notice--info">
                <p>
                  <strong>Fixora support:</strong> {c.adminResponse}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New complaint"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="complaint-form" loading={saving}>
              Submit
            </Button>
          </>
        }
      >
        <form id="complaint-form" className="stack" onSubmit={submit} noValidate>
          <Select label="Type" value={form.type} onChange={update('type')} options={COMPLAINT_TYPES} required />
          {['booking', 'payment', 'provider'].includes(form.type) && (
            <Select
              label="Booking"
              value={form.bookingId}
              onChange={update('bookingId')}
              placeholder={form.type === 'booking' ? 'Select a booking' : 'Select a booking (optional)'}
              options={bookingOptions}
              error={errors.bookingId}
              required={form.type === 'booking'}
            />
          )}
          <Input label="Subject" value={form.subject} onChange={update('subject')} error={errors.subject} maxLength={120} required />
          <Input as="textarea" rows={5} label="Description" value={form.description} onChange={update('description')} error={errors.description} maxLength={3000} required />
        </form>
      </Modal>
    </>
  );
}
