import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/layout/Logo';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ServiceForm from '../../components/providers/ServiceForm';
import ProviderProfile from './ProviderProfile';
import ProviderAvailability from './ProviderAvailability';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getOwnProfile, listOwnServices, createService, getOwnAvailability } from '../../features/providers/provider.service';
import { profileChecklist } from '../../features/providers/provider.utils';
import { formatDuration, formatPrice } from '../../utils/format';

const STEPS = [
  { key: 'account', label: 'Account' },
  { key: 'profile', label: 'Profile' },
  { key: 'services', label: 'Services' },
  { key: 'availability', label: 'Availability' },
  { key: 'submit', label: 'Review' },
];

/** Services wizard step: list what's been added so far + a form to add one more. */
function ServicesStep({ onBack, onNext }) {
  const { data: services, loading, setData } = useAsync(listOwnServices, []);
  const [formKey, setFormKey] = useState(0);

  const add = async (payload) => {
    const created = await createService(payload);
    setData((list) => [...(list || []), created]);
    setFormKey((k) => k + 1); // remount the form blank so another service can be added
  };

  return (
    <div className="stack stack--lg">
      <section className="card stack">
        <h2 className="card__title">Your services</h2>
        {loading && <Loader />}
        {services && services.length === 0 && <EmptyState icon="briefcase" title="No services added yet." message="Add at least one so customers can book you." />}
        {services && services.length > 0 && (
          <ul className="simple-list">
            {services.map((s) => (
              <li key={s.id} className="simple-list__item">
                <span>{s.title}</span>
                <span className="muted small">
                  {formatPrice(s.price, s.pricingType)} · {formatDuration(s.duration)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ServiceForm key={formKey} submitLabel="Add service" onCancel={null} onSubmit={add} />
      <div className="row row--between onboarding-nav">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!services?.length}>
          Continue
        </Button>
      </div>
    </div>
  );
}

/** Final review step: profile-completeness checklist + submit for verification. */
function ReviewStep({ onBack }) {
  const navigate = useNavigate();
  const { data: provider, loading: loadingProvider } = useAsync(getOwnProfile, []);
  const { data: services } = useAsync(listOwnServices, []);
  const { data: availability, loading: loadingAvailability } = useAsync(getOwnAvailability, []);

  if (loadingProvider || loadingAvailability) return <Loader />;

  const serviceCount = services?.filter((s) => s.active).length || 0;
  const checklist = provider ? profileChecklist(provider, serviceCount) : [];
  const hasAvailability = Object.values(availability?.weekly || {}).some((d) => d.enabled);
  const items = [...checklist, { label: 'Weekly availability set', done: hasAvailability }];
  const allDone = items.every((i) => i.done);

  return (
    <div className="stack stack--lg">
      <section className="card stack">
        <h2 className="card__title">Review your profile</h2>
        <ul className="checklist">
          {items.map((item) => (
            <li key={item.label} className={item.done ? 'is-done' : ''}>
              <Icon name={item.done ? 'check-circle' : 'alert'} size={16} />
              {item.label}
            </li>
          ))}
        </ul>
        {!allDone && <p className="muted small">You can still submit now and finish these later from your dashboard — but a complete profile gets verified faster.</p>}
      </section>

      <section className="notice notice--info">
        <Icon name="shield" size={18} />
        <p>
          Once submitted, your application is under review. Our team checks every provider before they appear in search — this
          usually takes 1–2 business days. You can keep editing your profile, services and availability while you wait.
        </p>
      </section>

      <div className="row row--between onboarding-nav">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => navigate('/provider/dashboard')}>Submit application</Button>
      </div>
    </div>
  );
}

export default function ProviderOnboarding() {
  useDocumentTitle('Set up your provider account');
  const [stepIndex, setStepIndex] = useState(0);

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));
  const step = STEPS[stepIndex].key;

  return (
    <div className="onboarding-shell">
      <header className="onboarding-shell__header">
        <Logo />
        <h1>Set up your provider account</h1>
        <p className="muted">A few steps to get your profile ready for customers.</p>
        <ol className="onboarding-steps">
          {STEPS.map((s, i) => (
            <li key={s.key} className={`onboarding-steps__item ${i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''}`}>
              <span className="onboarding-steps__dot">{i < stepIndex ? <Icon name="check" size={14} /> : i + 1}</span>
              <span>{s.label}</span>
            </li>
          ))}
        </ol>
      </header>

      <div className="onboarding-shell__content">
        {step === 'account' && (
          <section className="card stack">
            <h2 className="card__title">Account created</h2>
            <p>Your provider account is ready. Next, let&apos;s build your public profile — this is what customers will see.</p>
            <div className="row row--end">
              <Button onClick={goNext}>Continue</Button>
            </div>
          </section>
        )}

        {step === 'profile' && (
          <div className="stack stack--lg">
            <ProviderProfile onSaved={goNext} />
            <div className="row onboarding-nav">
              <Button variant="ghost" onClick={goBack}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 'services' && <ServicesStep onBack={goBack} onNext={goNext} />}

        {step === 'availability' && (
          <div className="stack stack--lg">
            <ProviderAvailability onSaved={goNext} />
            <div className="row onboarding-nav">
              <Button variant="ghost" onClick={goBack}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 'submit' && <ReviewStep onBack={goBack} />}
      </div>
    </div>
  );
}
