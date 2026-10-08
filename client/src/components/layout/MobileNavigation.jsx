import { NavLink } from 'react-router-dom';
import Icon from '../common/Icon';
import { MOBILE_PRIMARY, NAVIGATION } from '../../constants/navigation';
import { useAuth } from '../../features/auth/auth.context';

/**
 * Bottom tab bar on phones. Roles with 5 primary destinations (customer, provider) fill
 * every slot; roles with fewer (admin) get a trailing "More" button that opens the full sidebar.
 */
export default function MobileNavigation({ onMore }) {
  const { user } = useAuth();
  const role = user?.role;
  const items = (MOBILE_PRIMARY[role] || []).map((to) => NAVIGATION[role].find((item) => item.to === to)).filter(Boolean);
  const showMore = items.length < 5;

  return (
    <nav className="mobile-nav" aria-label="Quick navigation">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-nav__item ${isActive ? 'is-active' : ''}`}>
          <Icon name={item.icon} size={20} />
          <span>{item.label.split(' ')[0]}</span>
        </NavLink>
      ))}
      {showMore && (
        <button type="button" className="mobile-nav__item" onClick={onMore}>
          <Icon name="more" size={20} />
          <span>More</span>
        </button>
      )}
    </nav>
  );
}
