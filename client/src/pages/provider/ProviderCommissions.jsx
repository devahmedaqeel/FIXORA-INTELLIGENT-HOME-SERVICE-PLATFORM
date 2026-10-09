import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import ListState from '../../components/dashboard/ListState';
import { usePagedList } from '../../hooks/usePagedList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { listMyCommissions } from '../../services/finance.service';
import { COMMISSION_STATUS_LABELS, COMMISSION_STATUS_TONES } from '../../constants';
import { formatDate, formatGBP } from '../../utils/format';

const STATUS_OPTIONS = Object.entries(COMMISSION_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export default function ProviderCommissions() {
  useDocumentTitle('Commissions');
  const navigate = useNavigate();
  const list = usePagedList(listMyCommissions, { status: '' }, 10);

  return (
    <div className="stack stack--xl">
      <PageHeader
        title="Commissions"
        description="Platform commission owed on completed, paid bookings. Submit your payment here once you've paid Fixora — our team verifies it."
      />
      <div className="toolbar">
        <Select label="Status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)} placeholder="All statuses" options={STATUS_OPTIONS} />
      </div>
      <ListState list={list} emptyTitle="No commissions yet. A commission is generated automatically once a booking is completed and paid." emptyIcon="file">
        <DataTable
          caption="Commissions"
          rows={list.items}
          onRowClick={(row) => navigate(`/provider/commissions/${row.id}`)}
          columns={[
            { key: 'createdAt', label: 'Created', render: (r) => formatDate(r.createdAt.slice(0, 10)) },
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
