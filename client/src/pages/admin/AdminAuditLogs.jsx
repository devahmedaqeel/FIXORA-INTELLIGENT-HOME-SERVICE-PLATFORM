import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import DataTable from '../../components/common/DataTable';
import ListState from '../../components/dashboard/ListState';
import { usePagedList } from '../../hooks/usePagedList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { listAuditLogs } from '../../services/finance.service';
import { formatDateTime, formatGBP } from '../../utils/format';

export default function AdminAuditLogs() {
  useDocumentTitle('Audit logs');
  const list = usePagedList(listAuditLogs, { action: '', bookingId: '' }, 50);

  return (
    <div className="stack stack--lg">
      <PageHeader title="Audit logs" description="Immutable trail of every payment and commission state change. Nothing here can be edited or deleted." />
      <div className="toolbar">
        <Input label="Filter by action" placeholder="e.g. commission_verified" value={list.filters.action} onChange={(e) => list.setFilter('action', e.target.value)} />
        <Input label="Filter by booking ID" value={list.filters.bookingId} onChange={(e) => list.setFilter('bookingId', e.target.value)} />
      </div>
      <ListState list={list} emptyTitle="No audit log entries match this filter." emptyIcon="inbox">
        <DataTable
          caption="Audit logs"
          rows={list.items}
          rowKey="id"
          columns={[
            { key: 'createdAt', label: 'When', render: (l) => formatDateTime(l.createdAt) },
            { key: 'action', label: 'Action', render: (l) => l.action.replace(/_/g, ' ') },
            { key: 'actorName', label: 'By', render: (l) => `${l.actorName || l.actorId} (${l.actorRole})` },
            { key: 'amountGBP', label: 'Amount', className: 'num', render: (l) => (l.amountGBP != null ? formatGBP(l.amountGBP) : '—') },
            { key: 'details', label: 'Details' },
          ]}
        />
      </ListState>
    </div>
  );
}
