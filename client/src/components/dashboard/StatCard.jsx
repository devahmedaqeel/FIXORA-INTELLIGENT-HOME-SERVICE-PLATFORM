import { Link } from 'react-router-dom';
import Icon from '../common/Icon';

/** Headline number tile for dashboards. */
export default function StatCard({ label, value, icon, tone = 'primary', to, hint }) {
  const content = (
    <>
      <span className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon name={icon} size={20} />
      </span>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {hint && <p className="stat-card__hint">{hint}</p>}
      </div>
    </>
  );
  return to ? (
    <Link to={to} className="stat-card stat-card--link">
      {content}
    </Link>
  ) : (
    <div className="stat-card">{content}</div>
  );
}

export function StatGrid({ children }) {
  return <div className="stat-grid">{children}</div>;
}
