import { useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import Icon from '../common/Icon';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/account.service';
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
};

/** In-app notifications page body (customer & provider). */
export default function NotificationsList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(listNotifications, []);

  const open = async (notification) => {
    if (!notification.read) {
      markNotificationRead(notification.id).catch(() => {});
      setData((d) => ({
        items: d.items.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
        unreadCount: Math.max(d.unreadCount - 1, 0),
      }));
    }
    if (notification.link) navigate(notification.link);
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      setData((d) => ({ items: d.items.map((n) => ({ ...n, read: true })), unreadCount: 0 }));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description={data ? `${data.unreadCount} unread` : undefined}
        actions={data?.unreadCount > 0 && <Button variant="secondary" size="sm" icon="check" onClick={markAll}>Mark all as read</Button>}
      />
      {loading && <Loader />}
      <ErrorMessage error={error} onRetry={reload} />
      {data && data.items.length === 0 && <EmptyState icon="bell" title="No notifications yet." message="Booking updates and messages will appear here." />}
      {data && data.items.length > 0 && (
        <ul className="notification-list">
          {data.items.map((n) => (
            <li key={n.id}>
              <button type="button" className={`notification ${n.read ? '' : 'is-unread'}`} onClick={() => open(n)}>
                <span className="notification__icon">
                  <Icon name={TYPE_ICONS[n.type] || 'bell'} size={18} />
                </span>
                <span className="notification__body">
                  <span className="notification__title">{n.title}</span>
                  <span className="notification__text">{n.message}</span>
                  <span className="muted small">{timeAgo(n.createdAt)}</span>
                </span>
                {!n.read && <span className="notification__dot" aria-label="Unread" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
