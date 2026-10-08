import { Outlet } from 'react-router-dom';
import Logo from '../components/layout/Logo';
import Icon from '../components/common/Icon';

const POINTS = [
  'Only verified providers appear in search',
  'Search by area or postcode',
  'Free cancellation up to the cutoff time',
];

/** Split-screen layout for sign in / sign up / password reset. */
export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__brand">
        <Logo light />
        <div>
          <h2>Trusted help for every home in the UK.</h2>
          <ul className="auth-shell__points">
            {POINTS.map((p) => (
              <li key={p}>
                <Icon name="check-circle" size={18} />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="small">Plumbers · Electricians · Cleaners · AC repair · Tutors and more</p>
      </aside>
      <main className="auth-shell__main" id="main">
        <div className="auth-shell__mobile-logo">
          <Logo />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
