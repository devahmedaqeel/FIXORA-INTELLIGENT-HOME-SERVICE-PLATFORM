import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import DataTable from '../../components/common/DataTable';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { listAdmins, listPendingInvites, createAdminInvite } from '../../services/admin.service';
import { fieldErrorsFromApi } from '../../utils/validation';
import { formatDateTime } from '../../utils/format';

/**
 * The only UI path by which an existing admin can bring on another one. The invite link is
 * shown once here — it is never emailed automatically — so the admin must share it privately.
 * It expires in 48 hours and can only be redeemed once, for the exact email it was issued to.
 */
export default function AdminTeam() {
  useDocumentTitle('Admin team');
  const toast = useToast();
  const admins = useAsync(listAdmins, []);
  const invites = useAsync(listPendingInvites, []);
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [lastInvite, setLastInvite] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      const invite = await createAdminInvite(email.trim());
      setLastInvite(invite);
      setEmail('');
      invites.reload();
      toast.success('Invite created — copy the link below and share it privately');
    } catch (err) {
      setError(fieldErrorsFromApi(err).email || err.message);
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.info('Copy failed — select and copy the link manually');
    }
  };

  return (
    <div className="stack stack--xl">
      <PageHeader title="Admin team" description="Administrators and pending invites. The admin role can never be self-assigned — it is only granted via a one-time invite link or the trusted server-side setup script." />

      <form className="card stack" onSubmit={submit}>
        <h2 className="card__title">Invite a new administrator</h2>
        <div className="row row--wrap row--end">
          <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} required />
          <Button type="submit" loading={creating} icon="send">
            Create invite
          </Button>
        </div>
        {lastInvite && (
          <div className="notice notice--success stack">
            <p>
              Invite created for <strong>{lastInvite.email}</strong>, expires {formatDateTime(lastInvite.expiresAt)}.
            </p>
            <div className="row row--wrap">
              <code style={{ wordBreak: 'break-all', flex: '1 1 300px' }}>{lastInvite.signupUrl}</code>
              <Button type="button" size="sm" variant="secondary" onClick={() => copyLink(lastInvite.signupUrl)}>
                Copy link
              </Button>
            </div>
          </div>
        )}
      </form>

      <section className="stack">
        <h2>Pending invites</h2>
        {invites.loading ? (
          <Loader />
        ) : invites.error ? (
          <ErrorMessage error={invites.error} onRetry={invites.reload} />
        ) : invites.data.length === 0 ? (
          <EmptyState icon="mail" title="No pending invites." />
        ) : (
          <DataTable
            caption="Pending invites"
            rows={invites.data}
            rowKey="email"
            columns={[
              { key: 'email', label: 'Email' },
              { key: 'invitedByName', label: 'Invited by' },
              { key: 'createdAt', label: 'Created', render: (i) => formatDateTime(i.createdAt) },
              { key: 'expiresAt', label: 'Expires', render: (i) => formatDateTime(i.expiresAt) },
            ]}
          />
        )}
      </section>

      <section className="stack">
        <h2>Administrators</h2>
        {admins.loading ? (
          <Loader />
        ) : admins.error ? (
          <ErrorMessage error={admins.error} onRetry={admins.reload} />
        ) : (
          <DataTable
            caption="Administrators"
            rows={admins.data}
            rowKey="uid"
            columns={[
              { key: 'displayName', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'createdAt', label: 'Admin since', render: (u) => formatDateTime(u.createdAt) },
            ]}
          />
        )}
      </section>
    </div>
  );
}
