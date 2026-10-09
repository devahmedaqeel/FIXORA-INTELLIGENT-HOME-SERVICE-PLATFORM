import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { useAuth } from '../features/auth/auth.context';
import { safeRedirect } from '../features/auth/auth.utils';

/**
 * Guards /admin/login and /admin/signup. Unlike the generic GuestRoute, this only redirects
 * away when the signed-in account is ALREADY an admin — a customer or provider session in
 * the same browser must still be able to open the admin login form (and sign in as admin,
 * which replaces the current Firebase session) instead of being silently bounced to their
 * own dashboard before they can even attempt it.
 */
export default function AdminGuestRoute() {
  const { loading, isAuthenticated, user } = useAuth();
  const [params] = useSearchParams();
  if (loading) return <Loader fullPage />;
  if (isAuthenticated && user.role === 'admin') {
    return <Navigate to={safeRedirect(params.get('redirect')) || '/admin/dashboard'} replace />;
  }
  return <Outlet />;
}
