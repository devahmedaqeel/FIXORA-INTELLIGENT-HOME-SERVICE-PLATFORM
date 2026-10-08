import { useEffect, useRef, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import TagInput from '../../components/common/TagInput';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Icon from '../../components/common/Icon';
import AreaMultiSelect from '../../components/search/AreaMultiSelect';
import PhotoUpload from '../../components/dashboard/PhotoUpload';
import ProviderVerificationBadge from '../../components/providers/ProviderVerificationBadge';
import { useAsync } from '../../hooks/useAsync';
import { useCategories } from '../../hooks/useCategories';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../features/auth/auth.context';
import { getOwnProfile, updateOwnProfile } from '../../features/providers/provider.service';
import { uploadVerificationDocument } from '../../services/storage.service';
import { fieldErrorsFromApi, isPakistaniPhone } from '../../utils/validation';
import { PROVIDER_LANGUAGES, RESPONSE_TIME_OPTIONS } from '../../constants';

export default function ProviderProfile() {
  useDocumentTitle('Provider profile');
  const { user, updateLocal } = useAuth();
  const toast = useToast();
  const { categories } = useCategories();
  const { data: provider, loading, error, reload, setData } = useAsync(getOwnProfile, []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docInput = useRef(null);

  useEffect(() => {
    if (!provider) return;
    setForm({
      displayName: provider.displayName,
      businessName: provider.businessName || '',
      title: provider.title || '',
      bio: provider.bio || '',
      phone: provider.phone || '',
      whatsapp: provider.whatsapp || '',
      showPhonePublicly: Boolean(provider.showPhonePublicly),
      experienceYears: provider.experienceYears || 0,
      categoryIds: provider.categoryIds || [],
      areas: provider.serviceAreas || [],
      languages: provider.languages || [],
      specializations: provider.specializations || [],
      responseTime: provider.responseTime || '',
      serviceRadiusKm: provider.serviceRadiusKm ?? '',
      verificationDocuments: provider.verificationDocuments || [],
    });
  }, [provider]);

  if (loading || (!form && !error)) return <Loader />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const toggleCategory = (id) =>
    setForm((f) => ({ ...f, categoryIds: f.categoryIds.includes(id) ? f.categoryIds.filter((c) => c !== id) : [...f.categoryIds, id] }));
  const toggleLanguage = (lang) =>
    setForm((f) => ({ ...f, languages: f.languages.includes(lang) ? f.languages.filter((l) => l !== lang) : [...f.languages, lang] }));

  const persist = async (changes, message = 'Profile saved') => {
    const updated = await updateOwnProfile(changes);
    setData(updated);
    updateLocal({ provider: updated, user: { ...user, displayName: updated.displayName, photoURL: updated.photoURL, phone: updated.phone } });
    toast.success(message);
    return updated;
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (form.displayName.trim().length < 2) next.displayName = 'Enter your name';
    if (form.phone && !isPakistaniPhone(form.phone)) next.phone = 'Enter a valid Pakistani phone number';
    if (form.whatsapp && !isPakistaniPhone(form.whatsapp)) next.whatsapp = 'Enter a valid Pakistani phone number';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await persist({
        displayName: form.displayName.trim(),
        businessName: form.businessName.trim(),
        title: form.title.trim(),
        bio: form.bio.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        showPhonePublicly: form.showPhonePublicly,
        experienceYears: Number(form.experienceYears) || 0,
        categoryIds: form.categoryIds,
        areaIds: form.areas.map((a) => a.id),
        languages: form.languages,
        specializations: form.specializations,
        responseTime: form.responseTime,
        serviceRadiusKm: form.serviceRadiusKm === '' ? undefined : Number(form.serviceRadiusKm),
      });
    } catch (err) {
      setErrors(fieldErrorsFromApi(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addDocument = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (form.verificationDocuments.length >= 5) {
      toast.error('You can upload up to 5 documents');
      return;
    }
    setUploadingDoc(true);
    try {
      const { url, path } = await uploadVerificationDocument(user.uid, file);
      const docs = [...form.verificationDocuments, { name: file.name.slice(0, 120), url, path }];
      await persist({ verificationDocuments: docs }, 'Document uploaded');
    } catch (err) {
      toast.error(err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const removeDocument = (index) => persist({ verificationDocuments: form.verificationDocuments.filter((_, i) => i !== index) }, 'Document removed').catch(toast.error);

  return (
    <div className="stack stack--xl narrow-page">
      <PageHeader
        title="Provider profile"
        description="This is what customers see. A complete profile is verified faster."
        actions={<ProviderVerificationBadge status={provider.verificationStatus} />}
      />

      <section className="card">
        <PhotoUpload
          uid={user.uid}
          role="provider"
          name={provider.displayName}
          value={provider.photoURL}
          onUploaded={(photoURL) => persist({ photoURL }, 'Photo updated')}
        />
      </section>

      <form className="stack stack--lg" onSubmit={submit} noValidate>
        <section className="card stack">
          <h2 className="card__title">Basic details</h2>
          <div className="form-grid">
            <Input label="Your name" value={form.displayName} onChange={set('displayName')} error={errors.displayName} required />
            <Input label="Business name (optional)" value={form.businessName} onChange={set('businessName')} maxLength={100} />
            <Input
              label="Professional title (optional)"
              value={form.title}
              onChange={set('title')}
              maxLength={80}
              placeholder="e.g. Licensed Electrician"
              hint="Shown under your name on your public profile."
            />
            <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="03001234567" />
            <Input label="WhatsApp (optional)" type="tel" value={form.whatsapp} onChange={set('whatsapp')} error={errors.whatsapp} />
            <Input label="Years of experience" type="number" min="0" max="70" value={form.experienceYears} onChange={set('experienceYears')} />
          </div>
          <label className="checkbox">
            <input type="checkbox" checked={form.showPhonePublicly} onChange={set('showPhonePublicly')} />
            <span>Show my phone numbers on my public profile</span>
          </label>
          <Input as="textarea" rows={5} label="About you" value={form.bio} onChange={set('bio')} maxLength={1500} hint="Experience, specialities, tools, guarantees — at least 30 characters." />
        </section>

        <section className="card stack">
          <h2 className="card__title">Service categories</h2>
          <div className="checkbox-grid" role="group" aria-label="Service categories">
            {categories.map((c) => (
              <label key={c.id} className={`check-tile ${form.categoryIds.includes(c.id) ? 'is-selected' : ''}`}>
                <input type="checkbox" checked={form.categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="card stack">
          <h2 className="card__title">Professional details</h2>
          <div className="field">
            <span className="field__label">Languages you speak</span>
            <div className="checkbox-grid" role="group" aria-label="Languages">
              {PROVIDER_LANGUAGES.map((lang) => (
                <label key={lang} className={`check-tile ${form.languages.includes(lang) ? 'is-selected' : ''}`}>
                  <input type="checkbox" checked={form.languages.includes(lang)} onChange={() => toggleLanguage(lang)} />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
          </div>
          <TagInput
            label="Specializations / skills (optional)"
            value={form.specializations}
            onChange={(specializations) => setForm((f) => ({ ...f, specializations }))}
            max={15}
            maxLength={40}
            placeholder="e.g. Inverter repair"
            hint="Add specific skills beyond your service categories."
          />
          <div className="form-grid">
            <Select
              label="Typical response time"
              value={form.responseTime}
              onChange={set('responseTime')}
              options={RESPONSE_TIME_OPTIONS}
              placeholder="Not set"
            />
            <Input
              label="Service radius (km, optional)"
              type="number"
              min="0"
              max="200"
              value={form.serviceRadiusKm}
              onChange={set('serviceRadiusKm')}
              hint="How far you're willing to travel beyond your listed areas."
            />
          </div>
        </section>

        <section className="card stack">
          <h2 className="card__title">Service areas</h2>
          <AreaMultiSelect value={form.areas} onChange={(areas) => setForm((f) => ({ ...f, areas }))} />
        </section>

        <div className="row row--end sticky-actions">
          <Button type="submit" loading={saving} size="lg">
            Save profile
          </Button>
        </div>
      </form>

      <section className="card stack">
        <h2 className="card__title">Verification documents</h2>
        <p className="muted small">Upload a CNIC copy, trade licence or certificates (PDF or image, up to 5 MB). Only you and Fixora admins can view them.</p>
        {form.verificationDocuments.length > 0 && (
          <ul className="simple-list">
            {form.verificationDocuments.map((doc, index) => (
              <li key={doc.url} className="simple-list__item">
                <a href={doc.url} target="_blank" rel="noreferrer" className="row">
                  <Icon name="file" size={18} /> {doc.name}
                </a>
                <Button variant="ghost" size="sm" icon="trash" onClick={() => removeDocument(index)} aria-label={`Remove ${doc.name}`} />
              </li>
            ))}
          </ul>
        )}
        <input ref={docInput} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={addDocument} id="doc-input" />
        <div>
          <Button variant="secondary" icon="upload" loading={uploadingDoc} onClick={() => docInput.current?.click()}>
            Upload document
          </Button>
        </div>
      </section>
    </div>
  );
}
