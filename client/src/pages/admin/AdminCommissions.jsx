import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import ListState from '../../components/dashboard/ListState';
import { usePagedList } from '../../hooks/usePagedList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { listCommissions } from '../../services/finance.service';
import { COMMISSION_STATUS_LABELS, COMMISSION_STATUS_TONES } from '../../constants';
import { formatDate, formatGBP } from '../../utils/format';

const STATUS_OPTIONS = Object.entries(COMMISSION_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export default function AdminCommissions() {
  useDocumentTitle('Commissions');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const list = usePagedList(listCommissions, { status: params.get('status') || '', q: '' }, 20);

  return (
    <div className="stack stack--lg">
      <PageHeader title="Commissions" description="Provider commission owed on completed, paid bookings. Verify submitted payments, resolve disputes, or waive where appropriate." />
      <div className="toolbar">
        <Select label="Status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)} placeholder="All statuses" options={STATUS_OPTIONS} />
        <Input label="Search" placeholder="Provider, service or booking" value={list.filters.q} onChange={(e) => list.setFilter('q', e.target.value)} />
      </div>
      <ListState list={list} emptyTitle="No commissions match this filter." emptyIcon="file">
        <DataTable
          caption="Commissions"
          rows={list.items}
          onRowClick={(row) => navigate(`/admin/commissions/${row.id}`)}
          columns={[
            { key: 'providerName', label: 'Provider' },
            { key: 'serviceTitle', label: 'Service' },
            { key: 'commissionAmountGBP', label: 'Commission', className: 'num', render: (r) => formatGBP(r.commissionAmountGBP) },
            { key: 'remainingAmountGBP', label: 'Remaining', className: 'num', render: (r) => formatGBP(r.remainingAmountGBP) },
            { key: 'dueDate', label: 'Due', render: (r) => formatDate(r.dueDate) },
            { key: 'status', label: 'Status', render: (r) => <Badge tone={COMMISSION_STATUS_TONES[r.status] || 'neutral'}>{COMMISSION_STATUS_LABELS[r.status] || r.status}</Badge> },
          ]}
        />
      </ListState>
    </div>
  );
}
