import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { PROVINCE_OPTIONS, ADDRESS_LABEL_OPTIONS } from '../../constants';

const blankAddress = {
  label: 'home',
  houseNumber: '',
  street: '',
  area: '',
  city: '',
  district: '',
  province: '',
  postalCode: '',
  additionalDetails: '',
  isDefault: false,
};

/** Add/edit form for a customer saved address. onSave receives the plain address payload. */
export default function AddressForm({ address, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...blankAddress, ...address });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.area.trim()) next.area = 'Enter an area or neighbourhood';
    if (!form.city.trim()) next.city = 'Enter a city';
    if (!form.province) next.province = 'Select a province';
    if (form.postalCode && !/^\d{5}$/.test(form.postalCode)) next.postalCode = 'Postal code must be 5 digits';
    setErrors(next);
    if (Object.keys(next).length) return;
    await onSave({
      label: form.label,
      houseNumber: form.houseNumber.trim(),
      street: form.street.trim(),
      area: form.area.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      province: form.province,
      postalCode: form.postalCode.trim(),
      additionalDetails: form.additionalDetails.trim(),
      isDefault: form.isDefault,
    });
  };

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <div className="form-grid">
        <Select label="Label" value={form.label} onChange={set('label')} options={ADDRESS_LABEL_OPTIONS} required />
        <Input label="House / flat number" value={form.houseNumber} onChange={set('houseNumber')} maxLength={40} />
      </div>
      <Input label="Street" value={form.street} onChange={set('street')} maxLength={120} />
      <div className="form-grid">
        <Input label="Area / neighbourhood" value={form.area} onChange={set('area')} error={errors.area} required />
        <Input label="City" value={form.city} onChange={set('city')} error={errors.city} required />
        <Input label="District" value={form.district} onChange={set('district')} />
        <Select label="Province" value={form.province} onChange={set('province')} options={PROVINCE_OPTIONS} error={errors.province} placeholder="Select province" required />
        <Input label="Postal code (optional)" value={form.postalCode} onChange={set('postalCode')} error={errors.postalCode} maxLength={5} placeholder="10250" />
      </div>
      <Input as="textarea" rows={2} label="Additional details (optional)" value={form.additionalDetails} onChange={set('additionalDetails')} maxLength={200} hint="Landmark, gate code, delivery instructions…" />
      <label className="checkbox">
        <input type="checkbox" checked={form.isDefault} onChange={set('isDefault')} />
        <span>Set as default address</span>
      </label>
      <div className="row row--end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save address
        </Button>
      </div>
    </form>
  );
}
