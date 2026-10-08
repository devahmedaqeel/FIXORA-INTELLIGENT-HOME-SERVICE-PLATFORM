import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Icon from '../../components/common/Icon';
import { useAuth } from '../../features/auth/auth.context';
import { authErrorMessage, dashboardPathFor, safeRedirect } from '../../features/auth/auth.utils';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { isEmail, isUkPhone, passwordProblem, fieldErrorsFromApi } from '../../utils/validation';

const ROLE_OPTIONS = [
  { value: 'customer', icon: 'home', title: 'I need a service', text: 'Book verified professionals' },
  { value: 'provider', icon: 'briefcase', title: 'I provide services', text: 'Get bookings in your area' },
];

export default function Register() {
  useDocumentTitle('Create account');
  const { register, completeProfile, needsProfile, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Finishing an interrupted sign-up: the Firebase account exists, only the profile is missing.
  const completing = needsProfile && Boolean(firebaseUser);

  const [form, setForm] = useState({
    role: params.get('role') === 'provider' ? 'provider' : 'customer',
    displayName: firebaseUser?.displayName || '',
    email: '',
    password: '',
    phone: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    const next = {};
    if (form.displayName.trim().length < 2) next.displayName = 'Enter your full name';
    if (!completing) {
      if (!isEmail(form.email)) next.email = 'Enter a valid email address';
      const pw = passwordProblem(form.password);
      if (pw) next.password = pw;
    }
    if (form.phone && !isUkPhone(form.phone)) next.phone = 'Enter a valid UK number, e.g. 07911 123456';
    if (!form.acceptTerms) next.acceptTerms = 'Please accept the terms to continue';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = { role: form.role, displayName: form.displayName.trim(), phone: form.phone.trim() };
      const session = completing ? await completeProfile(payload) : await register({ ...payload, email: form.email, password: form.password });
      const redirect = safeRedirect(params.get('redirect'));
      const fallback = session.user.role === 'provider' ? '/provider/onboarding' : dashboardPathFor(session.user.role);
      navigate(redirect && redirect.startsWith(`/${session.user.role}`) ? redirect : fallback, { replace: true });
    } catch (err) {
      setErrors(fieldErrorsFromApi(err));
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>{completing ? 'Finish setting up your account' : 'Create your account'}</h1>
      <p className="muted">{completing ? 'Just a few details to complete your registration.' : 'It takes less than a minute.'}</p>

      <form className="stack" onSubmit={submit} noValidate>
        <fieldset className="role-picker">
          <legend className="field__label">I want to</legend>
          {ROLE_OPTIONS.map((option) => (
            <label key={option.value} className={`role-option ${form.role === option.value ? 'is-selected' : ''}`}>
              <input type="radio" name="role" value={option.value} checked={form.role === option.value} onChange={set('role')} className="sr-only" />
              <Icon name={option.icon} size={22} />
              <span>
                <strong>{option.title}</strong>
                <span className="muted small">{option.text}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <Input label="Full name" autoComplete="name" value={form.displayName} onChange={set('displayName')} error={errors.displayName} required />
        {!completing && (
          <>
            <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} required />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              hint="At least 8 characters with a letter and a number"
              required
            />
          </>
        )}
        <Input label="Phone (optional)" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="07911 123456" />

        {form.role === 'provider' && (
          <div className="notice notice--info">
            <Icon name="shield" size={18} />
            <p>Provider accounts are reviewed by our team before appearing in search. You can set up your profile and services right away.</p>
          </div>
        )}

        <label className="checkbox">
          <input type="checkbox" checked={form.acceptTerms} onChange={set('acceptTerms')} aria-invalid={Boolean(errors.acceptTerms) || undefined} />
          <span>
            I agree to the <Link to="/terms">Terms of service</Link> and <Link to="/privacy">Privacy policy</Link>.
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="field__error" role="alert">
            {errors.acceptTerms}
          </p>
        )}

        <ErrorMessage error={error} compact />
        <Button type="submit" block size="lg" loading={submitting}>
          {completing ? 'Complete registration' : 'Create account'}
        </Button>
      </form>
      {!completing && (
        <p className="auth-card__switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      )}
    </div>
  );
}
