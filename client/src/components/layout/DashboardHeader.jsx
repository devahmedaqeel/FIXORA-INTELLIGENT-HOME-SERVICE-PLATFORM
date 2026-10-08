import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import { useAuth } from '../../features/auth/auth.context';
import { listNotifications } from '../../services/account.service';

/** Top bar inside dashboards: menu toggle (mobile), notifications bell with unread count, user chip. */
export default function DashboardHeader({ onMenu }) {
  const { user } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    listNotifications()
      .then((data) => active && setUnread(data.unreadCount))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const notificationsPath = `/${user?.role}/notifications`;

  return (
    <header className="dash-header">
      <button type="button" className="icon-btn dash-header__menu" onClick={onMenu} aria-label="Open navigation">
        <Icon name="menu" />
      </button>
      <div className="dash-header__spacer" />
      {user?.role !== 'admin' && (
        <Link to={notificationsPath} className="icon-btn dash-header__bell" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
          <Icon name="bell" />
          {unread > 0 && <span className="dot-count">{unread > 9 ? '9+' : unread}</span>}
        </Link>
      )}
      <Link to={`/${user?.role}/${user?.role === 'admin' ? 'settings' : 'profile'}`} className="dash-header__user">
        <Avatar src={user?.photoURL} name={user?.displayName} size={34} />
        <span className="dash-header__name">{user?.displayName}</span>
      </Link>
    </header>
  );
}
