import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import BarChart from '../../components/charts/BarChart';
import StatCard, { StatGrid } from '../../components/dashboard/StatCard';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getEarnings } from '../../features/providers/provider.service';
import { PAYMENT_STATUS_LABELS } from '../../constants';
import { formatDate, formatMonth, formatPKR } from '../../utils/format';

export default function ProviderEarnings() {
  useDocumentTitle('Earnings');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(() => getEarnings({ page, limit: 10 }), [page]);

  if (loading && !data) return <Loader />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;
  const { summary, monthly, items } = data.items;

  return (
    <div className="stack stack--xl">
      <PageHeader title="Earnings" description="Income from completed bookings. Cash collected directly counts as collected." />
      <StatGrid>
        <StatCard label="Total earnings" value={formatPKR(summary.totalEarnings)} icon="wallet" tone="accent" />
        <StatCard label="This month" value={formatPKR(summary.thisMonth)} icon="calendar" />
        <StatCard label="Completed jobs" value={summary.completedJobs} icon="check-circle" tone="success" />
        <StatCard label="Average per job" value={formatPKR(summary.averagePerJob)} icon="chart" />
        <StatCard label="Outstanding (unpaid)" value={formatPKR(summary.outstanding)} icon="alert" tone="warning" />
      </StatGrid>
      <section className="card">
        <BarChart title="Earnings over the last 12 months" formatValue={formatPKR} data={monthly.map((m) => ({ label: formatMonth(m.month), value: m.earnings }))} />
      </section>
      <section className="stack">
        <h2>Completed jobs</h2>
        {items.length === 0 ? (
          <EmptyState icon="wallet" title="No earnings yet." message="Completed bookings will show up here." />
        ) : (
          <DataTable
            caption="Completed jobs"
            rows={items}
            columns={[
              { key: 'bookingDate', label: 'Date', render: (r) => formatDate(r.bookingDate) },
              { key: 'serviceTitle', label: 'Service' },
              { key: 'customerName', label: 'Customer' },
              { key: 'paymentStatus', label: 'Payment', render: (r) => <Badge tone={r.paymentStatus === 'unpaid' ? 'warning' : 'success'}>{PAYMENT_STATUS_LABELS[r.paymentStatus]}</Badge> },
              { key: 'amount', label: 'Amount', className: 'num', render: (r) => formatPKR(r.amount) },
            ]}
          />
        )}
        <Pagination meta={data.meta} onChange={setPage} />
      </section>
    </div>
  );
}
