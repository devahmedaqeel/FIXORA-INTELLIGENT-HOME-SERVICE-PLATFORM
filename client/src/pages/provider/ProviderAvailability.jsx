import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Icon from '../../components/common/Icon';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { getOwnAvailability, updateOwnAvailability } from '../../features/providers/provider.service';
import { WEEKDAYS } from '../../constants';
import { formatDate } from '../../utils/format';
import { todayUk } from '../../utils/date';

export default function ProviderAvailability({ onSaved }) {
  useDocumentTitle('Availability');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(getOwnAvailability, []);
  const [weekly, setWeekly] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [slotInterval, setSlotInterval] = useState('30');
  const [buffer, setBuffer] = useState('0');
  const [newException, setNewException] = useState({ date: '', reason: '' });
  const [problems, setProblems] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setWeekly(data.weekly);
    setExceptions(data.exceptions || []);
    setSlotInterval(String(data.slotIntervalMinutes || 30));
    setBuffer(String(data.bufferMinutes || 0));
  }, [data]);

  if (loading || (!weekly && !error)) return <Loader />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  const setDay = (day, changes) => setWeekly((w) => ({ ...w, [day]: { ...w[day], ...changes } }));

  const addException = () => {
    if (!newException.date || newException.date < todayUk()) {
      toast.error('Choose today or a future date');
      return;
    }
    if (exceptions.some((e) => e.date === newException.date)) return;
    setExceptions((list) => [...list, newException].sort((a, b) => a.date.localeCompare(b.date)));
    setNewException({ date: '', reason: '' });
  };

  const save = async () => {
    const next = {};
    WEEKDAYS.forEach(({ key }) => {
      const d = weekly[key];
      if (d.enabled && d.start >= d.end) next[key] = 'End time must be after start time';
    });
    setProblems(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await updateOwnAvailability({ weekly, exceptions, slotIntervalMinutes: Number(slotInterval), bufferMinutes: Number(buffer) });
      toast.success('Availability saved');
      onSaved?.();
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack stack--lg narrow-page">
      <PageHeader title="Availability" description="Customers can only book free slots inside these hours. Overlapping bookings are blocked automatically." />

      <section className="card stack">
        <h2 className="card__title">Weekly hours</h2>
        <ul className="week-editor">
          {WEEKDAYS.map(({ key, label }) => {
            const day = weekly[key];
            return (
              <li key={key} className={`week-editor__row ${day.enabled ? '' : 'is-off'}`}>
                <label className="switch">
                  <input type="checkbox" checked={day.enabled} onChange={(e) => setDay(key, { enabled: e.target.checked })} />
                  <span className="switch__track" aria-hidden="true" />
                  <span className="week-editor__day">{label}</span>
                </label>
                {day.enabled ? (
                  <div className="week-editor__times">
                    <label className="sr-only" htmlFor={`${key}-start`}>
                      {label} start
                    </label>
                    <input id={`${key}-start`} type="time" className="field__control" value={day.start} step="900" onChange={(e) => setDay(key, { start: e.target.value })} />
                    <span aria-hidden="true">–</span>
                    <label className="sr-only" htmlFor={`${key}-end`}>
                      {label} end
                    </label>
                    <input id={`${key}-end`} type="time" className="field__control" value={day.end} step="900" onChange={(e) => setDay(key, { end: e.target.value })} />
                  </div>
                ) : (
                  <span className="muted">Off</span>
                )}
                {problems[key] && (
                  <p className="field__error week-editor__error" role="alert">
                    {problems[key]}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <div className="form-grid">
          <Select
            label="Slot interval"
            value={slotInterval}
            onChange={(e) => setSlotInterval(e.target.value)}
            options={[
              { value: '15', label: 'Every 15 minutes' },
              { value: '30', label: 'Every 30 minutes' },
              { value: '60', label: 'Every hour' },
            ]}
            hint="How often start times are offered"
          />
          <Input label="Buffer between jobs (minutes)" type="number" min="0" max="120" step="5" value={buffer} onChange={(e) => setBuffer(e.target.value)} hint="Travel time kept free around each booking" />
        </div>
      </section>

      <section className="card stack">
        <h2 className="card__title">Days off & exceptions</h2>
        <div className="form-grid form-grid--end">
          <Input label="Date" type="date" min={todayUk()} value={newException.date} onChange={(e) => setNewException((x) => ({ ...x, date: e.target.value }))} />
          <Input label="Reason (optional)" value={newException.reason} maxLength={120} onChange={(e) => setNewException((x) => ({ ...x, reason: e.target.value }))} />
          <Button variant="secondary" icon="plus" onClick={addException}>
            Add date
          </Button>
        </div>
        {exceptions.length === 0 ? (
          <p className="muted">No upcoming days off.</p>
        ) : (
          <ul className="simple-list">
            {exceptions.map((ex) => (
              <li key={ex.date} className="simple-list__item">
                <span className="row">
                  <Icon name="calendar" size={16} /> {formatDate(ex.date)} {ex.reason && <span className="muted">· {ex.reason}</span>}
                </span>
                <Button variant="ghost" size="sm" icon="trash" aria-label={`Remove ${ex.date}`} onClick={() => setExceptions((list) => list.filter((e) => e.date !== ex.date))} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="row row--end sticky-actions">
        <Button size="lg" onClick={save} loading={saving}>
          {onSaved ? 'Save & continue' : 'Save availability'}
        </Button>
      </div>
    </div>
  );
}
