import { useState } from 'react';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import Input from '../common/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../features/auth/auth.context';
import { requestPasswordReset, resendVerificationEmail } from '../../features/auth/auth.service';
import { deleteMe } from '../../services/account.service';

/** Security & account section shared by customer profile and provider settings. */
export default function AccountSettings() {
  const { user, firebaseUser, logout } = useAuth();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const sendReset = async () => {
    try {
      await requestPasswordReset(user.email);
      toast.success(`Password reset link sent to ${user.email}`);
    } catch (err) {
      toast.error(err);
    }
  };

  const verify = async () => {
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent');
    } catch (err) {
      toast.error(err);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteMe();
      toast.success('Your account has been deleted');
      await logout().catch(() => {});
    } catch (err) {
      toast.error(err);
      setDeleting(false);
    }
  };

  return (
    <section className="card stack" aria-labelledby="account-heading">
      <h2 id="account-heading" className="card__title">
        Account & security
      </h2>
      <div className="row row--between row--wrap">
        <div>
          <p className="strong">Email</p>
          <p className="muted">
            {user.email} · {firebaseUser?.emailVerified ? 'verified' : 'not verified'}
          </p>
        </div>
        {!firebaseUser?.emailVerified && (
          <Button variant="secondary" size="sm" onClick={verify}>
            Resend verification email
          </Button>
        )}
      </div>
      <div className="row row--between row--wrap">
        <div>
          <p className="strong">Password</p>
          <p className="muted">We&apos;ll email you a secure link to set a new password.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={sendReset}>
          Send reset link
        </Button>
      </div>
      <div className="danger-zone">
        <div>
          <p className="strong">Delete account</p>
          <p className="muted">
            Cancels your upcoming bookings and removes your personal details. Past booking records are kept in anonymised form.
          </p>
        </div>
        <Button variant="danger" size="sm" icon="trash" onClick={() => setConfirmOpen(true)}>
          Delete account
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete your account?"
        confirmLabel="Delete permanently"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => (confirmText === 'DELETE' ? remove() : toast.error('Type DELETE to confirm'))}
      >
        <p>This cannot be undone. Type DELETE to confirm.</p>
        <Input label="Confirmation" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
      </ConfirmDialog>
    </section>
  );
}
