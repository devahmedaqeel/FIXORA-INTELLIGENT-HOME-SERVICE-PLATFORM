import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { useAuth } from '../features/auth/auth.context';
import { dashboardPathFor, safeRedirect } from '../features/auth/auth.utils';

/**
 * Sign-in / sign-up pages: a signed-in customer/provider is sent to their dashboard (or
 * ?redirect=) instead of seeing the form again. An admin session does NOT redirect away
 * here — the mirror image of AdminGuestRoute — so an admin can still open /login to sign
 * in as a different account in the same browser instead of being silently bounced.
 */
export default function GuestRoute() {
  const { loading, isAuthenticated, user } = useAuth();
  const [params] = useSearchParams();
  if (loading) return <Loader fullPage />;
  if (isAuthenticated && user.role !== 'admin') {
    return <Navigate to={safeRedirect(params.get('redirect')) || dashboardPathFor(user.role)} replace />;
  }
  return <Outlet />;
}
