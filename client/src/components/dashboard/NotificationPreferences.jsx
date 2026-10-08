import { useState } from 'react';
import Button from '../common/Button';
import { useAuth } from '../../features/auth/auth.context';
import { useToast } from '../../context/ToastContext';
import { updateMe } from '../../services/account.service';

const CATEGORY_TOGGLES = [
  { key: 'bookingUpdates', label: 'Booking updates', hint: 'New requests, confirmations, cancellations, completions and messages.' },
  { key: 'reviewUpdates', label: 'Reviews', hint: 'New reviews and review reminders.' },
  { key: 'accountUpdates', label: 'Account & verification', hint: 'Verification status changes and complaint updates.' },
  { key: 'promotional', label: 'Promotional', hint: "Offers and news. We'll only use this when we have something to share." },
];

const CHANNEL_TOGGLES = [
  { key: 'emailEnabled', label: 'Email notifications' },
  { key: 'smsEnabled', label: 'SMS notifications' },
];

/** Notification preference toggles shared by customer profile and provider settings. */
export default function NotificationPreferences() {
  const { user, updateLocal } = useAuth();
  const toast = useToast();
  const [prefs, setPrefs] = useState(user.notificationPreferences);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(prefs) !== JSON.stringify(user.notificationPreferences);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateMe({ notificationPreferences: prefs });
      updateLocal({ user: updated });
      toast.success('Notification preferences saved');
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card stack" aria-labelledby="notifications-heading">
      <h2 id="notifications-heading" className="card__title">
        Notifications
      </h2>
      <div className="stack">
        {CATEGORY_TOGGLES.map(({ key, label, hint }) => (
          <div key={key} className="row row--between">
            <span>
              <span className="strong">{label}</span>
              <span className="muted small"> — {hint}</span>
            </span>
            <label className="switch">
              <input type="checkbox" checked={Boolean(prefs[key])} onChange={() => toggle(key)} aria-label={label} />
              <span className="switch__track" aria-hidden="true" />
            </label>
          </div>
        ))}
      </div>
      <div className="stack divider-top">
        <p className="strong small">Delivery channels</p>
        {CHANNEL_TOGGLES.map(({ key, label }) => (
          <div key={key} className="row row--between">
            <span>{label}</span>
            <label className="switch">
              <input type="checkbox" checked={Boolean(prefs[key])} onChange={() => toggle(key)} aria-label={label} />
              <span className="switch__track" aria-hidden="true" />
            </label>
          </div>
        ))}
      </div>
      <div className="row row--end">
        <Button onClick={save} loading={saving} disabled={!dirty}>
          Save preferences
        </Button>
      </div>
    </section>
  );
}
