import { NavLink } from 'react-router-dom';
import Logo from '../layout/Logo';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import { NAVIGATION } from '../../constants/navigation';
import { useAuth } from '../../features/auth/auth.context';

/**
 * Admin-only sidebar — a dedicated component, not a reskin of the customer/provider Sidebar.
 * Fixed on desktop; slide-in drawer on tablet/phone (same responsive pattern, own CSS).
 */
export default function AdminSidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      <div className={`admin-sidebar-backdrop ${open ? 'is-visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Admin navigation">
        <div className="admin-sidebar__top">
          <Logo to="/admin/dashboard" light />
          <button type="button" className="icon-btn admin-sidebar__close" onClick={onClose} aria-label="Close navigation">
            <Icon name="x" />
          </button>
        </div>
        <div className="admin-sidebar__badge">Admin portal</div>
        <div className="admin-sidebar__user">
          <Avatar src={user?.photoURL} name={user?.displayName} size={40} />
          <div>
            <p className="admin-sidebar__name">{user?.displayName}</p>
            <p className="admin-sidebar__role">Administrator</p>
          </div>
        </div>
        <nav className="admin-sidebar__nav">
          <ul>
            {NAVIGATION.admin.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => `admin-sidebar__link ${isActive ? 'is-active' : ''}`} onClick={onClose}>
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" className="admin-sidebar__link admin-sidebar__logout" onClick={logout}>
          <Icon name="log-out" size={18} />
          <span>Sign out</span>
        </button>
      </aside>
    </>
  );
}
