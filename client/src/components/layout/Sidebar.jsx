import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import { NAVIGATION } from '../../constants/navigation';
import { useAuth } from '../../features/auth/auth.context';

/** Dashboard sidebar. Fixed on desktop; slide-in drawer on tablet/phone. */
export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const items = NAVIGATION[user?.role] || [];

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'is-visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Dashboard navigation">
        <div className="sidebar__top">
          <Logo to="/" light />
          <button type="button" className="icon-btn sidebar__close" onClick={onClose} aria-label="Close navigation">
            <Icon name="x" />
          </button>
        </div>
        <div className="sidebar__user">
          <Avatar src={user?.photoURL} name={user?.displayName} size={40} />
          <div>
            <p className="sidebar__name">{user?.displayName}</p>
            <p className="sidebar__role">{user?.role}</p>
          </div>
        </div>
        <nav className="sidebar__nav">
          <ul>
            {items.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`} onClick={onClose}>
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" className="sidebar__link sidebar__logout" onClick={logout}>
          <Icon name="log-out" size={18} />
          <span>Sign out</span>
        </button>
      </aside>
    </>
  );
}
