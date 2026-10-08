import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { useCategories } from '../../hooks/useCategories';
import { PRICING_TYPES } from '../../constants';
import { fieldErrorsFromApi } from '../../utils/validation';

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240, 300, 360, 480].map((m) => ({
  value: String(m),
  label: m < 60 ? `${m} minutes` : `${m / 60} hour${m > 60 ? 's' : ''}`,
}));

/** Create/edit form for a provider service. onSubmit(payload) must return a promise. */
export default function ServiceForm({ initial, onSubmit, submitLabel = 'Save service' }) {
  const { categories } = useCategories();
  const [form, setForm] = useState({
    categoryId: initial?.categoryId || '',
    title: initial?.title || '',
    description: initial?.description || '',
    price: initial?.price ?? '',
    pricingType: initial?.pricingType || 'fixed',
    duration: String(initial?.duration || 60),
    active: initial?.active ?? true,
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.categoryId) next.categoryId = 'Choose a category';
    if (form.title.trim().length < 3) next.title = 'Title must be at least 3 characters';
    if (form.price === '' || Number(form.price) < 0) next.price = 'Enter a price of 0 or more';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        categoryId: form.categoryId,
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        pricingType: form.pricingType,
        duration: Number(form.duration),
        active: form.active,
      });
    } catch (err) {
      setErrors(fieldErrorsFromApi(err));
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card stack narrow-page" onSubmit={submit} noValidate>
      <Select
        label="Category"
        value={form.categoryId}
        onChange={set('categoryId')}
        placeholder="Select a category"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        error={errors.categoryId}
        required
      />
      <Input label="Service title" value={form.title} onChange={set('title')} error={errors.title} maxLength={100} placeholder="e.g. Kitchen tap repair" required />
      <Input as="textarea" rows={4} label="Description" value={form.description} onChange={set('description')} maxLength={1500} hint="What's included, what customers should prepare." />
      <div className="form-grid">
        <Input label="Price (Rs)" type="number" min="0" step="50" inputMode="numeric" value={form.price} onChange={set('price')} error={errors.price} required />
        <Select label="Pricing type" value={form.pricingType} onChange={set('pricingType')} options={PRICING_TYPES} error={errors.pricingType} />
        <Select label="Typical duration" value={form.duration} onChange={set('duration')} options={DURATIONS} hint="Used to calculate free time slots" error={errors.duration} />
      </div>
      <label className="checkbox">
        <input type="checkbox" checked={form.active} onChange={set('active')} />
        <span>Active — customers can book this service</span>
      </label>
      <ErrorMessage error={error} compact />
      <div className="row row--end">
        <Button to="/provider/services" variant="ghost">
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
