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
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleSubmitting(true);
    try {
      const session = await loginWithGoogle();
      if (session?.needsProfile) {
        navigate(`/register${params.get('redirect') ? `?redirect=${encodeURIComponent(params.get('redirect'))}` : ''}`);
        return;
      }
      const redirect = safeRedirect(params.get('redirect'));
      const target = redirect && redirect.startsWith(`/${session.user.role}`) ? redirect : dashboardPathFor(session.user.role);
      navigate(target, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setGoogleSubmitting(false);
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

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="btn btn--google btn--block"
          onClick={handleGoogleSignIn}
          disabled={googleSubmitting || submitting}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {googleSubmitting ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </form>
      <p className="auth-card__switch">
        New to Fixora? <Link to={`/register${params.get('redirect') ? `?redirect=${encodeURIComponent(params.get('redirect'))}` : ''}`}>Create an account</Link>
      </p>
    </div>
  );
}
