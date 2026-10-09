import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Logo from '../../components/layout/Logo';
import { useAuth } from '../../features/auth/auth.context';
import { authErrorMessage, safeRedirect } from '../../features/auth/auth.utils';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useMetaRobots } from '../../hooks/useMetaRobots';
import { isEmail } from '../../utils/validation';

/** Separate from the customer/provider Login page. Rejects (and signs out) any non-admin account. */
export default function AdminLogin() {
  useDocumentTitle('Admin sign in');
  useMetaRobots();
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!isEmail(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Enter your password';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setError('');
    try {
      await adminLogin(form.email, form.password);
      navigate(safeRedirect(params.get('redirect')) || '/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.errorCode === 'NOT_ADMIN' ? err.message : authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-auth-shell">
      <div className="auth-card admin-auth-card">
        <Logo />
        <h1>Admin portal</h1>
        <p className="muted">Sign in to manage the Fixora platform.</p>
        <form className="stack" onSubmit={submit} noValidate>
          <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} required />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            required
          />
          <ErrorMessage error={error} compact />
          <Button type="submit" block size="lg" loading={submitting}>
            Sign in
          </Button>
        </form>
        <p className="auth-card__switch">
          Need an admin account? Ask an existing administrator for an invite link.
          <br />
          <Link to="/login">Not an admin? Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
