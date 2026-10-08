import { WEEKDAYS } from '../../constants';
import { formatTime } from '../../utils/format';

/** Read-only weekly working hours. */
export default function WeeklySchedule({ weekly = {} }) {
  return (
    <dl className="schedule">
      {WEEKDAYS.map(({ key, label }) => {
        const day = weekly[key];
        return (
          <div key={key} className={`schedule__row ${day?.enabled ? '' : 'is-off'}`}>
            <dt>{label}</dt>
            <dd>{day?.enabled ? `${formatTime(day.start)} – ${formatTime(day.end)}` : 'Off'}</dd>
          </div>
        );
      })}
    </dl>
  );
}
