import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { ADDRESS_LABEL_OPTIONS } from '../../constants';
import { isPostcode } from '../../utils/validation';

const blankAddress = {
  label: 'home',
  addressLine1: '',
  addressLine2: '',
  city: '',
  county: '',
  postcode: '',
  additionalDetails: '',
  isDefault: false,
};

/** Add/edit form for a customer saved address (UK format). onSave receives the plain address payload. */
export default function AddressForm({ address, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...blankAddress, ...address });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.addressLine1.trim()) next.addressLine1 = 'Enter the first line of the address';
    if (!form.city.trim()) next.city = 'Enter a town or city';
    if (!isPostcode(form.postcode)) next.postcode = 'Enter a valid UK postcode, e.g. SW1A 1AA';
    setErrors(next);
    if (Object.keys(next).length) return;
    await onSave({
      label: form.label,
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      county: form.county.trim(),
      postcode: form.postcode.trim().toUpperCase(),
      additionalDetails: form.additionalDetails.trim(),
      isDefault: form.isDefault,
    });
  };

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <Select label="Label" value={form.label} onChange={set('label')} options={ADDRESS_LABEL_OPTIONS} required />
      <Input label="Address line 1" value={form.addressLine1} onChange={set('addressLine1')} error={errors.addressLine1} required />
      <Input label="Address line 2 (optional)" value={form.addressLine2} onChange={set('addressLine2')} maxLength={120} />
      <div className="form-grid">
        <Input label="Town / city" value={form.city} onChange={set('city')} error={errors.city} required />
        <Input label="County (optional)" value={form.county} onChange={set('county')} />
        <Input label="Postcode" value={form.postcode} onChange={set('postcode')} error={errors.postcode} maxLength={8} placeholder="SW1A 1AA" required />
      </div>
      <Input as="textarea" rows={2} label="Additional details (optional)" value={form.additionalDetails} onChange={set('additionalDetails')} maxLength={200} hint="Landmark, buzzer code, delivery instructions…" />
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
