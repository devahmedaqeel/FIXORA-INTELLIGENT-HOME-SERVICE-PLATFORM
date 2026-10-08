import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import NotificationBell from '../notifications/NotificationBell';
import { useAuth } from '../../features/auth/auth.context';

/** Top bar inside dashboards: menu toggle (mobile), notifications bell with unread count, user chip. */
export default function DashboardHeader({ onMenu }) {
  const { user } = useAuth();

  return (
    <header className="dash-header">
      <button type="button" className="icon-btn dash-header__menu" onClick={onMenu} aria-label="Open navigation">
        <Icon name="menu" />
      </button>
      <div className="dash-header__spacer" />
      {user?.role !== 'admin' && <NotificationBell />}
      <Link to={`/${user?.role}/${user?.role === 'admin' ? 'settings' : 'profile'}`} className="dash-header__user">
        <Avatar src={user?.photoURL} name={user?.displayName} size={34} />
        <span className="dash-header__name">{user?.displayName}</span>
      </Link>
    </header>
  );
}
