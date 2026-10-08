import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AreaPicker from '../../components/search/AreaPicker';
import PhotoUpload from '../../components/dashboard/PhotoUpload';
import AccountSettings from '../../components/dashboard/AccountSettings';
import { useAuth } from '../../features/auth/auth.context';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getArea } from '../../services/catalog.service';
import { updateMe } from '../../services/account.service';
import { fieldErrorsFromApi, isPakistaniPhone } from '../../utils/validation';

export default function CustomerProfile() {
  useDocumentTitle('Profile');
  const { user, updateLocal } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ displayName: user.displayName, phone: user.phone, city: user.city, address: user.address });
  const [area, setArea] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user.defaultAreaId) getArea(user.defaultAreaId).then((a) => setArea({ ...a, label: `${a.areaName}, ${a.city}` })).catch(() => {});
  }, [user.defaultAreaId]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async (changes) => {
    const updated = await updateMe(changes);
    updateLocal({ user: updated });
    return updated;
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (form.displayName.trim().length < 2) next.displayName = 'Enter your name';
    if (form.phone && !isPakistaniPhone(form.phone)) next.phone = 'Enter a valid Pakistani phone number';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await save({ ...form, displayName: form.displayName.trim(), defaultAreaId: area?.id || '' });
      toast.success('Profile saved');
    } catch (err) {
      setErrors(fieldErrorsFromApi(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack stack--xl narrow-page">
      <PageHeader title="My profile" description="Your details are shared with providers only for bookings you make." />
      <section className="card stack">
        <PhotoUpload uid={user.uid} role="customer" name={user.displayName} value={user.photoURL} onUploaded={(photoURL) => save({ photoURL }).then(() => toast.success('Photo updated'))} />
        <form className="stack" onSubmit={submit} noValidate>
          <div className="form-grid">
            <Input label="Full name" value={form.displayName} onChange={set('displayName')} error={errors.displayName} required />
            <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="03001234567" />
            <Input label="City" value={form.city} onChange={set('city')} />
            <AreaPicker label="Home area" value={area} onChange={setArea} hint="Used to recommend providers near you" />
          </div>
          <Input as="textarea" rows={2} label="Default address" value={form.address} onChange={set('address')} hint="Pre-filled when you book" />
          <div className="row row--end">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </section>
      <AccountSettings />
    </div>
  );
}
