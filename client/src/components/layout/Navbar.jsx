import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Button from '../common/Button';
import Icon from '../common/Icon';
import { useAuth } from '../../features/auth/auth.context';
import { dashboardPathFor } from '../../features/auth/auth.utils';

const LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/search', label: 'Find a pro' },
  { to: '/about', label: 'How it works' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Logo />
        <button
          type="button"
          className="icon-btn navbar__toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'x' : 'menu'} />
        </button>
        <nav id="primary-navigation" className={`navbar__nav ${open ? 'is-open' : ''}`} aria-label="Main">
          <ul className="navbar__links">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="navbar__actions">
            {isAuthenticated ? (
              <>
                <Button to={dashboardPathFor(user.role)} variant="secondary" size="sm" icon="grid">
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" icon="log-out" onClick={handleLogout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button to="/register" size="sm">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
