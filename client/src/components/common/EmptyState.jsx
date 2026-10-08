import Icon from './Icon';

/** Friendly empty state: <EmptyState icon="calendar" title="No bookings found." action={<Button/>} /> */
export default function EmptyState({ icon = 'inbox', title, message, action }) {
  return (
    <div className="state state--empty">
      <span className="state__icon">
        <Icon name={icon} size={28} />
      </span>
      <p className="state__title">{title}</p>
      {message && <p className="state__text">{message}</p>}
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}
