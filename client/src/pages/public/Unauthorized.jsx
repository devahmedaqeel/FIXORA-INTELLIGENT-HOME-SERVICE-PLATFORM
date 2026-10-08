import Button from '../../components/common/Button';
import { useAuth } from '../../features/auth/auth.context';
import { dashboardPathFor } from '../../features/auth/auth.utils';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Unauthorized() {
  useDocumentTitle('Access denied');
  const { user } = useAuth();
  return (
    <div className="container page-section center status-page">
      <p className="status-page__code">403</p>
      <h1>You don&apos;t have access to that page</h1>
      <p className="muted">That area belongs to a different type of account.</p>
      <Button to={user ? dashboardPathFor(user.role) : '/login'}>{user ? 'Go to my dashboard' : 'Sign in'}</Button>
    </div>
  );
}
