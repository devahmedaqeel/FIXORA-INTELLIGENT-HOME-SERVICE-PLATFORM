import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { listPayments, resolvePaymentDispute } from '../../services/finance.service';
import { PAYMENT_CONFIRMATION_LABELS } from '../../constants';
import { formatDateTime, formatGBP } from '../../utils/format';

const TONES = { pending: 'neutral', customer_confirmed: 'info', provider_confirmed: 'info', paid: 'success', disputed: 'danger', partially_paid: 'warning', refunded: 'neutral' };
const STATUS_OPTIONS = Object.entries(PAYMENT_CONFIRMATION_LABELS).map(([value, label]) => ({ value, label }));

export default function AdminPayments() {
  useDocumentTitle('Payments');
  const toast = useToast();
  const [params] = useSearchParams();
  const list = usePagedList(listPayments, { status: params.get('status') || '', q: '' }, 20);
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('paid');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const open = (p) => {
    setSelected(p);
    setResolution('paid');
    setNote('');
  };

  const resolve = async () => {
    setSaving(true);
    try {
      const updated = await resolvePaymentDispute(selected.id, { resolution, note });
      list.replaceItem(selected.id, updated);
      toast.success('Dispute resolved');
      setSelected(null);
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader title="Payments" description="Dual-confirmed payments between customers and providers. Only disputes need your attention here." />
      <div className="toolbar">
        <Select label="Status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)} placeholder="All statuses" options={STATUS_OPTIONS} />
        <Input label="Search" placeholder="Customer, provider or service" value={list.filters.q} onChange={(e) => list.setFilter('q', e.target.value)} />
      </div>
      <ListState list={list} emptyTitle="No payments match this filter." emptyIcon="wallet">
        <DataTable
          caption="Payments"
          rows={list.items}
          onRowClick={open}
          columns={[
            { key: 'serviceTitle', label: 'Service' },
            { key: 'customerName', label: 'Customer' },
            { key: 'providerName', label: 'Provider' },
            { key: 'amountGBP', label: 'Amount', className: 'num', render: (p) => formatGBP(p.amountGBP) },
            { key: 'createdAt', label: 'Created', render: (p) => formatDateTime(p.createdAt) },
            { key: 'status', label: 'Status', render: (p) => <Badge tone={TONES[p.status] || 'neutral'}>{PAYMENT_CONFIRMATION_LABELS[p.status] || p.status}</Badge> },
          ]}
        />
      </ListState>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.serviceTitle} — £${selected.amountGBP}` : 'Payment'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Close
            </Button>
            {selected?.status === 'disputed' && (
              <Button onClick={resolve} loading={saving}>
                Resolve dispute
              </Button>
            )}
          </>
        }
      >
        {selected && (
          <div className="stack">
            <dl className="details-grid">
              <div>
                <dt>Customer</dt>
                <dd>
                  {selected.customerName} · confirmed: {selected.customerConfirmed ? 'yes' : 'no'}
                  {selected.customerMethod ? ` (${selected.customerMethod.replace('_', ' ')})` : ''}
                </dd>
              </div>
              <div>
                <dt>Provider</dt>
                <dd>
                  {selected.providerName} · confirmed: {selected.providerConfirmed ? 'yes' : 'no'}
                  {selected.providerMethod ? ` (${selected.providerMethod.replace('_', ' ')})` : ''}
                </dd>
              </div>
              <div>
                <dt>Booking</dt>
                <dd>{selected.bookingId}</dd>
              </div>
            </dl>
            {selected.status === 'disputed' && (
              <>
                <div className="notice notice--danger">
                  <p>
                    Disputed by {selected.disputedBy}: {selected.disputeReason}
                  </p>
                </div>
                <Select
                  label="Resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  options={[
                    { value: 'paid', label: 'Confirm payment was made' },
                    { value: 'refunded', label: 'Mark as refunded' },
                  ]}
                />
                <Input as="textarea" rows={3} label="Resolution note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
