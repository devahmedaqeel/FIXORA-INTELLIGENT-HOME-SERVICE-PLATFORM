import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import { useAuth } from '../../features/auth/auth.context';

/** Admin-only top bar — a dedicated component, not the shared DashboardHeader. */
export default function AdminHeader({ onMenu }) {
  const { user } = useAuth();

  return (
    <header className="admin-header">
      <button type="button" className="icon-btn admin-header__menu" onClick={onMenu} aria-label="Open navigation">
        <Icon name="menu" />
      </button>
      <div className="admin-header__spacer" />
      <Link to="/admin/settings" className="admin-header__user">
        <Avatar src={user?.photoURL} name={user?.displayName} size={34} />
        <span className="admin-header__name">{user?.displayName}</span>
      </Link>
    </header>
  );
}
