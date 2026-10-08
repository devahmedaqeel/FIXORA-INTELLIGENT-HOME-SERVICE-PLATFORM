import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import ListState from '../../components/dashboard/ListState';
import { usePagedList } from '../../hooks/usePagedList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { listComplaints, updateComplaint } from '../../services/admin.service';
import { COMPLAINT_STATUS_LABELS, COMPLAINT_TYPES } from '../../constants';
import { formatDateTime } from '../../utils/format';

const TONES = { open: 'warning', in_review: 'info', resolved: 'success', rejected: 'neutral' };
const STATUS_OPTIONS = Object.entries(COMPLAINT_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export default function ManageComplaints() {
  useDocumentTitle('Complaints');
  const toast = useToast();
  const list = usePagedList(listComplaints, { status: 'open' });
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: 'open', adminResponse: '' });
  const [saving, setSaving] = useState(false);

  const open = (c) => {
    setSelected(c);
    setForm({ status: c.status === 'open' ? 'in_review' : c.status, adminResponse: c.adminResponse || '' });
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateComplaint(selected.id, form);
      list.replaceItem(selected.id, updated);
      toast.success('Complaint updated and the user was notified');
      setSelected(null);
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader title="Complaints" description="Tickets raised by customers and providers." />
      <div className="toolbar">
        <Select label="Status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)} placeholder="All" options={STATUS_OPTIONS} />
      </div>
      <ListState list={list} emptyTitle="No complaints in this view." emptyIcon="alert">
        <DataTable
          caption="Complaints"
          rows={list.items}
          onRowClick={open}
          columns={[
            { key: 'subject', label: 'Subject', render: (c) => <strong>{c.subject}</strong> },
            { key: 'type', label: 'Type', render: (c) => COMPLAINT_TYPES.find((t) => t.value === c.type)?.label },
            { key: 'userName', label: 'From', render: (c) => `${c.userName} (${c.userRole})` },
            { key: 'createdAt', label: 'Submitted', render: (c) => formatDateTime(c.createdAt) },
            { key: 'status', label: 'Status', render: (c) => <Badge tone={TONES[c.status]}>{COMPLAINT_STATUS_LABELS[c.status]}</Badge> },
          ]}
        />
      </ListState>
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.subject || 'Complaint'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button onClick={save} loading={saving}>
              Save & notify user
            </Button>
          </>
        }
      >
        {selected && (
          <div className="stack">
            <p className="muted small">
              {selected.userName} · {selected.userEmail} · {formatDateTime(selected.createdAt)}
              {selected.bookingSummary && ` · Booking: ${selected.bookingSummary} (${selected.bookingId})`}
            </p>
            <p className="prewrap">{selected.description}</p>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
            <Input as="textarea" rows={4} label="Response to user" value={form.adminResponse} onChange={(e) => setForm({ ...form, adminResponse: e.target.value })} maxLength={2000} />
          </div>
        )}
      </Modal>
    </div>
  );
}
