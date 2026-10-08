import { useEffect, useMemo, useState } from 'react';
import Icon from '../common/Icon';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import { getAvailableSlots } from '../../features/providers/provider.service';
import { addDays, nextDays, todayPk, weekdayKey } from '../../utils/date';
import { formatDate, formatTime } from '../../utils/format';

const WINDOW = 7;

/**
 * Date strip + time-slot picker. Only slots returned by the server (which already excludes
 * days off, exceptions and existing bookings) can be selected.
 * value: { date, startTime } · onChange(next)
 */
export default function AvailabilityCalendar({ providerId, serviceId, weekly, value, onChange, refreshKey = 0, maxDays = 60 }) {
  const today = todayPk();
  const [windowStart, setWindowStart] = useState(today);
  const [slotsState, setSlotsState] = useState({ loading: false, error: null, data: null });
  const days = useMemo(() => nextDays(WINDOW, windowStart), [windowStart]);
  const lastBookable = addDays(today, maxDays);

  useEffect(() => {
    if (!value.date || !serviceId) return undefined;
    let active = true;
    setSlotsState({ loading: true, error: null, data: null });
    getAvailableSlots(providerId, value.date, serviceId)
      .then((data) => active && setSlotsState({ loading: false, error: null, data }))
      .catch((error) => active && setSlotsState({ loading: false, error, data: null }));
    return () => {
      active = false;
    };
  }, [providerId, serviceId, value.date, refreshKey]);

  const isDayOff = (date) => weekly && !weekly[weekdayKey(date)]?.enabled;

  return (
    <div className="calendar">
      <div className="calendar__nav">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setWindowStart(addDays(windowStart, -WINDOW))}
          disabled={windowStart <= today}
          aria-label="Previous week"
        >
          <Icon name="chevron-left" />
        </button>
        <p className="calendar__range">
          {formatDate(days[0], { day: 'numeric', month: 'short' })} – {formatDate(days[WINDOW - 1], { day: 'numeric', month: 'short' })}
        </p>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setWindowStart(addDays(windowStart, WINDOW))}
          disabled={addDays(windowStart, WINDOW) > lastBookable}
          aria-label="Next week"
        >
          <Icon name="chevron-right" />
        </button>
      </div>

      <div className="calendar__days" role="radiogroup" aria-label="Choose a date">
        {days.map((date) => {
          const off = isDayOff(date) || date > lastBookable;
          const selected = value.date === date;
          return (
            <button
              key={date}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`calendar__day ${selected ? 'is-selected' : ''} ${off ? 'is-off' : ''}`}
              disabled={off}
              onClick={() => onChange({ date, startTime: '' })}
            >
              <span className="calendar__weekday">{formatDate(date, { weekday: 'short' })}</span>
              <span className="calendar__num">{date.slice(8, 10)}</span>
              {off && <span className="sr-only">(unavailable)</span>}
            </button>
          );
        })}
      </div>

      <div className="calendar__slots" aria-live="polite">
        {!serviceId && <p className="muted">Choose a service first.</p>}
        {serviceId && !value.date && <p className="muted">Pick a date to see available times.</p>}
        {slotsState.loading && <Loader label="Checking availability…" />}
        <ErrorMessage error={slotsState.error} compact />
        {slotsState.data && !slotsState.data.available && <p className="muted">{slotsState.data.reason || 'No times available on this date.'}</p>}
        {slotsState.data?.available && (
          <div className="slot-grid" role="radiogroup" aria-label="Choose a start time">
            {slotsState.data.slots.map((slot) => (
              <button
                key={slot.startTime}
                type="button"
                role="radio"
                aria-checked={value.startTime === slot.startTime}
                className={`slot ${value.startTime === slot.startTime ? 'is-selected' : ''}`}
                onClick={() => onChange({ ...value, startTime: slot.startTime })}
              >
                {formatTime(slot.startTime)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
