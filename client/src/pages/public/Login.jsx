import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../features/auth/auth.context';
import { authErrorMessage, dashboardPathFor, safeRedirect } from '../../features/auth/auth.utils';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { isEmail } from '../../utils/validation';

export default function Login() {
  useDocumentTitle('Sign in');
  const { login } = useAuth();
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
      const session = await login(form.email, form.password);
      const redirect = safeRedirect(params.get('redirect'));
      // Only follow the redirect if it belongs to this user's area.
      const target = redirect && redirect.startsWith(`/${session.user.role}`) ? redirect : dashboardPathFor(session.user.role);
      navigate(target, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Welcome back</h1>
      <p className="muted">Sign in to manage your bookings.</p>
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
        <div className="row row--end">
          <Link to="/forgot-password" className="small">
            Forgot password?
          </Link>
        </div>
        <ErrorMessage error={error} compact />
        <Button type="submit" block size="lg" loading={submitting}>
          Sign in
        </Button>
      </form>
      <p className="auth-card__switch">
        New to Fixora? <Link to={`/register${params.get('redirect') ? `?redirect=${encodeURIComponent(params.get('redirect'))}` : ''}`}>Create an account</Link>
      </p>
    </div>
  );
}
