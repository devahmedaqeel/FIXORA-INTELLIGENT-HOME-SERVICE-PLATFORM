import { useMemo, useState } from 'react';
import AvailabilityCalendar from './AvailabilityCalendar';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import Icon from '../common/Icon';
import { createBooking } from '../../features/booking/booking.service';
import { formatDate, formatDuration, formatPrice, formatTime } from '../../utils/format';
import { fieldErrorsFromApi, isPakistaniPhone } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';

/**
 * Booking form: service → date → slot → address/notes → confirm.
 * The server performs the final availability and double-booking checks.
 */
export default function BookingForm({ profile, initialServiceId, customer, onBooked }) {
  const { provider, services, availability } = profile;
  const toast = useToast();
  const [serviceId, setServiceId] = useState(services.some((s) => s.id === initialServiceId) ? initialServiceId : services[0]?.id || '');
  const [slot, setSlot] = useState({ date: '', startTime: '' });
  const [form, setForm] = useState({
    areaId: provider.serviceAreas.some((a) => a.id === customer?.defaultAreaId) ? customer.defaultAreaId : '',
    customerAddress: customer?.address || '',
    customerPhone: customer?.phone || '',
    customerNotes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const service = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId]);
  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!serviceId) next.serviceId = 'Choose a service';
    if (!slot.date || !slot.startTime) next.slot = 'Choose a date and time';
    if (form.customerAddress.trim().length < 5) next.customerAddress = 'Enter the full address where the service is needed';
    if (form.customerPhone && !isPakistaniPhone(form.customerPhone)) next.customerPhone = 'Enter a valid phone number, e.g. 03001234567';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const booking = await createBooking({
        providerId: provider.id,
        serviceId,
        bookingDate: slot.date,
        startTime: slot.startTime,
        customerAddress: form.customerAddress.trim(),
        customerNotes: form.customerNotes.trim(),
        ...(form.customerPhone ? { customerPhone: form.customerPhone.trim() } : {}),
        ...(form.areaId ? { areaId: form.areaId } : {}),
      });
      toast.success('Booking request sent!');
      onBooked?.(booking);
    } catch (error) {
      if (['BOOKING_CONFLICT', 'SLOT_UNAVAILABLE'].includes(error.errorCode)) {
        setSlot((s) => ({ ...s, startTime: '' }));
        setRefreshKey((k) => k + 1);
      }
      setErrors(fieldErrorsFromApi(error));
      setSubmitError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="booking-form" onSubmit={submit} noValidate>
      <div className="stack stack--lg">
        <section className="card">
          <h2 className="card__title">1. Service</h2>
          <Select
            label="Service"
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              setSlot((s) => ({ ...s, startTime: '' }));
            }}
            options={services.map((s) => ({ value: s.id, label: `${s.title} — ${formatPrice(s.price, s.pricingType)}` }))}
            error={errors.serviceId}
            required
          />
          {service && (
            <p className="muted small">
              {service.categoryName} · about {formatDuration(service.duration)}
              {service.description && <> · {service.description}</>}
            </p>
          )}
        </section>

        <section className="card">
          <h2 className="card__title">2. Date & time</h2>
          <AvailabilityCalendar
            providerId={provider.id}
            serviceId={serviceId}
            weekly={availability.weekly}
            value={slot}
            onChange={setSlot}
            refreshKey={refreshKey}
          />
          {errors.slot && (
            <p className="field__error" role="alert">
              {errors.slot}
            </p>
          )}
        </section>

        <section className="card">
          <h2 className="card__title">3. Where & details</h2>
          <div className="form-grid">
            {provider.serviceAreas.length > 0 && (
              <Select
                label="Area"
                value={form.areaId}
                onChange={update('areaId')}
                placeholder="Select your area (optional)"
                options={provider.serviceAreas.map((a) => ({ value: a.id, label: `${a.areaName}, ${a.city} (${a.postalCode})` }))}
              />
            )}
            <Input label="Phone for this booking" type="tel" value={form.customerPhone} onChange={update('customerPhone')} error={errors.customerPhone} placeholder="03001234567" />
          </div>
          <Input
            as="textarea"
            rows={2}
            label="Full address"
            value={form.customerAddress}
            onChange={update('customerAddress')}
            error={errors.customerAddress}
            placeholder="House #, street, sector/area, city"
            required
          />
          <Input
            as="textarea"
            rows={3}
            label="Notes for the provider (optional)"
            value={form.customerNotes}
            onChange={update('customerNotes')}
            maxLength={1000}
            placeholder="Describe the problem, access instructions, etc."
          />
        </section>
      </div>

      <aside className="booking-summary card">
        <h2 className="card__title">Summary</h2>
        <dl className="summary-list">
          <div>
            <dt>Provider</dt>
            <dd>{provider.businessName || provider.displayName}</dd>
          </div>
          <div>
            <dt>Service</dt>
            <dd>{service?.title || '—'}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{slot.date ? formatDate(slot.date) : '—'}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{slot.startTime ? formatTime(slot.startTime) : '—'}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{service ? formatPrice(service.price, service.pricingType) : '—'}</dd>
          </div>
        </dl>
        <p className="muted small summary-note">
          <Icon name="info" size={14} /> Pay the provider in cash after the job. The provider will confirm your request.
        </p>
        <ErrorMessage error={submitError} compact />
        <Button type="submit" block loading={submitting} disabled={!services.length}>
          Confirm booking
        </Button>
      </aside>
    </form>
  );
}
