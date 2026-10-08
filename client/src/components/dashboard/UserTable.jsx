import { useState } from 'react';
import DataTable from '../common/DataTable';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import ConfirmDialog from '../common/ConfirmDialog';
import ListState from './ListState';
import { usePagedList } from '../../hooks/usePagedList';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import { listUsers, updateUserStatus } from '../../services/admin.service';
import { formatDate } from '../../utils/format';
import { useEffect } from 'react';

const STATUS_TONES = { active: 'success', suspended: 'danger', deleted: 'neutral' };

/** Admin user list with search, filters and suspend/reactivate. Fixed `role` hides the role filter. */
export default function UserTable({ role }) {
  const toast = useToast();
  const list = usePagedList(listUsers, { role: role || '', status: '', q: '' });
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [target, setTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (debounced !== list.filters.q) list.setFilter('q', debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const apply = async () => {
    setBusy(true);
    const status = target.status === 'active' ? 'suspended' : 'active';
    try {
      const updated = await updateUserStatus(target.uid, status, reason);
      list.replaceItem(target.uid, updated);
      toast.success(status === 'suspended' ? 'User suspended' : 'User reactivated');
      setTarget(null);
      setReason('');
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack">
      <div className="toolbar">
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email or phone" className="toolbar__grow" />
        {!role && (
          <Select
            label="Role"
            value={list.filters.role}
            onChange={(e) => list.setFilter('role', e.target.value)}
            placeholder="All roles"
            options={[
              { value: 'customer', label: 'Customers' },
              { value: 'provider', label: 'Providers' },
              { value: 'admin', label: 'Admins' },
            ]}
          />
        )}
        <Select
          label="Status"
          value={list.filters.status}
          onChange={(e) => list.setFilter('status', e.target.value)}
          placeholder="Any status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'deleted', label: 'Deleted' },
          ]}
        />
      </div>
      <ListState list={list} emptyTitle="No users match these filters." emptyIcon="users">
        <DataTable
          caption="Users"
          rowKey="uid"
          rows={list.items}
          columns={[
            { key: 'displayName', label: 'Name', render: (u) => <strong>{u.displayName}</strong> },
            { key: 'email', label: 'Email', render: (u) => u.email || '—' },
            { key: 'phone', label: 'Phone', render: (u) => u.phone || '—' },
            { key: 'role', label: 'Role', render: (u) => <Badge tone="info">{u.role}</Badge> },
            { key: 'status', label: 'Status', render: (u) => <Badge tone={STATUS_TONES[u.status]}>{u.status}</Badge> },
            { key: 'createdAt', label: 'Joined', render: (u) => formatDate(u.createdAt) },
            {
              key: 'actions',
              label: 'Actions',
              render: (u) =>
                u.status !== 'deleted' &&
                u.role !== 'admin' && (
                  <Button size="sm" variant={u.status === 'active' ? 'danger' : 'secondary'} onClick={() => setTarget(u)}>
                    {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </Button>
                ),
            },
          ]}
        />
      </ListState>
      <ConfirmDialog
        open={Boolean(target)}
        title={target?.status === 'active' ? `Suspend ${target?.displayName}?` : `Reactivate ${target?.displayName}?`}
        confirmLabel={target?.status === 'active' ? 'Suspend' : 'Reactivate'}
        variant={target?.status === 'active' ? 'danger' : 'primary'}
        loading={busy}
        onConfirm={apply}
        onCancel={() => setTarget(null)}
      >
        {target?.status === 'active' && (
          <>
            <p>Suspended users cannot sign in or use the API. Suspended providers are hidden from search.</p>
            <Input label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} />
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
