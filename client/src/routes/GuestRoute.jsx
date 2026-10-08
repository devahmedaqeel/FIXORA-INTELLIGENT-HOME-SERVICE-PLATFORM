import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { useAuth } from '../features/auth/auth.context';
import { dashboardPathFor, safeRedirect } from '../features/auth/auth.utils';

/** Sign-in / sign-up pages: signed-in users are sent to their dashboard (or ?redirect=). */
export default function GuestRoute() {
  const { loading, isAuthenticated, user } = useAuth();
  const [params] = useSearchParams();
  if (loading) return <Loader fullPage />;
  if (isAuthenticated) return <Navigate to={safeRedirect(params.get('redirect')) || dashboardPathFor(user.role)} replace />;
  return <Outlet />;
}
