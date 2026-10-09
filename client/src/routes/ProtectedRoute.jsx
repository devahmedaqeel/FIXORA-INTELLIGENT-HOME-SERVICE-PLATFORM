import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { useAuth } from '../features/auth/auth.context';

/**
 * Guards dashboard routes. Unauthenticated → loginPath (with redirect back);
 * signed in with the wrong role → /unauthorized. The API enforces the same rules server-side.
 * The admin area passes loginPath="/admin/login" so an expired admin session never bounces
 * through the customer/provider sign-in page.
 */
export default function ProtectedRoute({ roles, loginPath = '/login' }) {
  const { loading, firebaseUser, user, needsProfile } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullPage label="Checking your session…" />;
  if (!firebaseUser) return <Navigate to={`${loginPath}?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (needsProfile) return <Navigate to="/register?complete=1" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
