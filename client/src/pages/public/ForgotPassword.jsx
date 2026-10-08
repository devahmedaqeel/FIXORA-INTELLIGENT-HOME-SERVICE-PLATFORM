import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Icon from '../../components/common/Icon';
import { requestPasswordReset } from '../../features/auth/auth.service';
import { authErrorMessage } from '../../features/auth/auth.utils';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { isEmail } from '../../utils/validation';

export default function ForgotPassword() {
  useDocumentTitle('Reset password');
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!isEmail(email)) {
      setFieldError('Enter a valid email address');
      return;
    }
    setFieldError('');
    setSubmitting(true);
    setError('');
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      // Don't reveal whether an account exists for this email.
      if (err.code === 'auth/user-not-found') setSent(true);
      else setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Reset your password</h1>
      {sent ? (
        <div className="stack">
          <div className="notice notice--success">
            <Icon name="mail" size={18} />
            <p>If an account exists for {email}, a password reset link is on its way. Check your inbox and spam folder.</p>
          </div>
          <Button to="/login" variant="secondary" block>
            Back to sign in
          </Button>
        </div>
      ) : (
        <form className="stack" onSubmit={submit} noValidate>
          <p className="muted">Enter your account email and we&apos;ll send you a reset link.</p>
          <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldError} required />
          <ErrorMessage error={error} compact />
          <Button type="submit" block size="lg" loading={submitting}>
            Send reset link
          </Button>
          <p className="auth-card__switch">
            <Link to="/login">Back to sign in</Link>
          </p>
        </form>
      )}
    </div>
  );
}
