import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../common/Icon';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '../../features/auth/auth.context';
import { listNotifications } from '../../services/account.service';

/** Bell icon with unread badge; click opens a dropdown notification center. */
export default function NotificationBell() {
  const { user } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    let active = true;
    listNotifications()
      .then((data) => active && setUnread(data.unreadCount))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  return (
    <div className="notif-bell" ref={rootRef}>
      <button
        type="button"
        className="icon-btn"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="bell" />
        {unread > 0 && <span className="dot-count">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <NotificationPanel notificationsPath={`/${user?.role}/notifications`} onUnreadChange={setUnread} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
