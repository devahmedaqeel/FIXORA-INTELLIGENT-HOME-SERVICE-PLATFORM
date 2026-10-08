import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { getSettings, updateSettings } from '../../services/admin.service';
import { fieldErrorsFromApi } from '../../utils/validation';

/** Platform business rules — the single source of truth used by the API. */
export default function AdminSettings() {
  useDocumentTitle('Platform settings');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(getSettings, []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (loading || (!form && !error)) return <Loader />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await updateSettings({
        bookingCancellationCutoffMinutes: Number(form.bookingCancellationCutoffMinutes),
        lateCancellationPolicy: form.lateCancellationPolicy,
        lateCancellationFeePercent: Number(form.lateCancellationFeePercent),
        slotIntervalMinutes: Number(form.slotIntervalMinutes),
        maxAdvanceBookingDays: Number(form.maxAdvanceBookingDays),
        supportEmail: form.supportEmail,
        supportPhone: form.supportPhone,
        platformName: form.platformName,
      });
      setForm(saved);
      setErrors({});
      toast.success('Settings saved — they apply immediately');
    } catch (err) {
      setErrors(fieldErrorsFromApi(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="stack stack--lg narrow-page" onSubmit={save} noValidate>
      <PageHeader title="Platform settings" description="Business rules applied by the booking engine for every client (web and future mobile)." />
      <section className="card stack">
        <h2 className="card__title">Cancellation policy</h2>
        <div className="form-grid">
          <Input
            label="Free cancellation cutoff (minutes before start)"
            type="number"
            min="0"
            max="10080"
            value={form.bookingCancellationCutoffMinutes}
            onChange={set('bookingCancellationCutoffMinutes')}
            error={errors.bookingCancellationCutoffMinutes}
            hint="Default 120 = 2 hours"
          />
          <Select
            label="After the cutoff"
            value={form.lateCancellationPolicy}
            onChange={set('lateCancellationPolicy')}
            options={[
              { value: 'warn', label: 'Allow with a warning' },
              { value: 'fee', label: 'Allow with a cancellation fee' },
              { value: 'block', label: 'Do not allow cancellation' },
            ]}
          />
          {form.lateCancellationPolicy === 'fee' && (
            <Input label="Late cancellation fee (% of price)" type="number" min="0" max="100" value={form.lateCancellationFeePercent} onChange={set('lateCancellationFeePercent')} error={errors.lateCancellationFeePercent} />
          )}
        </div>
      </section>
      <section className="card stack">
        <h2 className="card__title">Booking</h2>
        <div className="form-grid">
          <Select
            label="Default slot interval"
            value={String(form.slotIntervalMinutes)}
            onChange={set('slotIntervalMinutes')}
            options={[
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes' },
              { value: '60', label: '60 minutes' },
            ]}
            hint="Used when a provider hasn't chosen one"
          />
          <Input label="Bookable days in advance" type="number" min="1" max="365" value={form.maxAdvanceBookingDays} onChange={set('maxAdvanceBookingDays')} error={errors.maxAdvanceBookingDays} />
        </div>
      </section>
      <section className="card stack">
        <h2 className="card__title">Support contacts</h2>
        <div className="form-grid">
          <Input label="Platform name" value={form.platformName} onChange={set('platformName')} />
          <Input label="Support email" type="email" value={form.supportEmail} onChange={set('supportEmail')} error={errors.supportEmail} />
          <Input label="Support phone" value={form.supportPhone} onChange={set('supportPhone')} />
        </div>
      </section>
      <div className="row row--end sticky-actions">
        <Button type="submit" loading={saving} size="lg">
          Save settings
        </Button>
      </div>
    </form>
  );
}
