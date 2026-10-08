import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import NotificationItem from './NotificationItem';
import { useAsync } from '../../hooks/useAsync';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/account.service';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'booking', label: 'Bookings' },
  { key: 'review', label: 'Reviews' },
  { key: 'account', label: 'Account' },
  { key: 'system', label: 'System' },
];

/** Dropdown notification center: category tabs, mark-as-read, link to the full list. */
export default function NotificationPanel({ notificationsPath, onUnreadChange, onClose }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const { data, loading, error, reload, setData } = useAsync(listNotifications, []);

  const items = useMemo(() => {
    if (!data) return [];
    return tab === 'all' ? data.items : data.items.filter((n) => n.category === tab);
  }, [data, tab]);

  const open = (notification) => {
    if (!notification.read) {
      markNotificationRead(notification.id).catch(() => {});
      setData((d) => {
        const next = { items: d.items.map((n) => (n.id === notification.id ? { ...n, read: true } : n)), unreadCount: Math.max(d.unreadCount - 1, 0) };
        onUnreadChange?.(next.unreadCount);
        return next;
      });
    }
    onClose?.();
    if (notification.link) navigate(notification.link);
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      setData((d) => ({ items: d.items.map((n) => ({ ...n, read: true })), unreadCount: 0 }));
      onUnreadChange?.(0);
    } catch {
      // Non-critical; the full notifications page retries this action too.
    }
  };

  return (
    <div className="notif-panel" role="dialog" aria-label="Notifications">
      <div className="notif-panel__header">
        <h2 className="card__title">Notifications</h2>
        {data?.unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAll}>
            Mark all as read
          </Button>
        )}
      </div>
      <div className="notif-panel__tabs">
        <div className="tabs" role="tablist" aria-label="Notification categories">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`tabs__item ${tab === t.key ? 'is-active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="notif-panel__body">
        {loading && <Loader />}
        {error && <ErrorMessage error={error} onRetry={reload} />}
        {data && items.length === 0 && <EmptyState icon="bell" title="No notifications here." message="Check back later." />}
        {items.map((n) => (
          <NotificationItem key={n.id} notification={n} onOpen={open} />
        ))}
      </div>
      <div className="notif-panel__footer">
        <Button to={notificationsPath} variant="link" onClick={onClose}>
          View all notifications
        </Button>
      </div>
    </div>
  );
}
