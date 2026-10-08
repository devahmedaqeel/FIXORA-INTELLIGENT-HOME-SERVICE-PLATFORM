import Icon from '../common/Icon';
import { timeAgo } from '../../utils/format';

const TYPE_ICONS = {
  booking_created: 'calendar',
  booking_confirmed: 'check-circle',
  booking_rejected: 'x',
  booking_cancelled: 'x',
  booking_completed: 'check-circle',
  booking_updated: 'clock',
  new_review: 'star',
  provider_verified: 'shield',
  provider_status_changed: 'shield',
  complaint_update: 'alert',
  new_message: 'message',
};

/** One notification row, shared by the dropdown panel and the full notification center page. */
export default function NotificationItem({ notification, onOpen }) {
  return (
    <button type="button" className={`notification ${notification.read ? '' : 'is-unread'}`} onClick={() => onOpen(notification)}>
      <span className="notification__icon">
        <Icon name={TYPE_ICONS[notification.type] || 'bell'} size={18} />
      </span>
      <span className="notification__body">
        <span className="notification__title">{notification.title}</span>
        <span className="notification__text">{notification.message}</span>
        <span className="muted small">{timeAgo(notification.createdAt)}</span>
      </span>
      {!notification.read && <span className="notification__dot" aria-label="Unread" />}
    </button>
  );
}
