import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/common/DataTable';
import BarChart from '../../components/charts/BarChart';
import StatCard, { StatGrid } from '../../components/dashboard/StatCard';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getReportSummary } from '../../services/admin.service';
import { formatMonth, formatPKR } from '../../utils/format';

export default function Reports() {
  useDocumentTitle('Reports');
  const [months, setMonths] = useState('6');
  const { data, loading, error, reload } = useAsync(() => getReportSummary(months), [months]);

  return (
    <div className="stack stack--xl">
      <PageHeader
        title="Reports"
        description="Bookings, categories, providers and user growth."
        actions={
          <Select
            label="Period"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            options={[
              { value: '3', label: 'Last 3 months' },
              { value: '6', label: 'Last 6 months' },
              { value: '12', label: 'Last 12 months' },
            ]}
          />
        }
      />
      {loading && <Loader label="Generating report…" />}
      <ErrorMessage error={error} onRetry={reload} />
      {data && (
        <>
          <StatGrid>
            <StatCard label="Total bookings" value={data.bookings.totals.total} icon="calendar" />
            <StatCard label="Completed" value={data.bookings.totals.completed} icon="check-circle" tone="success" hint={`${data.bookings.totals.completionRate}% completion`} />
            <StatCard label="Cancelled" value={data.bookings.totals.cancelled} icon="x" tone="neutral" />
            <StatCard label="Completed revenue" value={formatPKR(data.bookings.totals.revenue)} icon="wallet" tone="accent" />
            <StatCard label="Avg provider rating" value={data.providers.platformAverageRating || '—'} icon="star" />
            <StatCard label="New customers" value={data.users.newCustomers} icon="user" />
            <StatCard label="New providers" value={data.users.newProviders} icon="briefcase" />
          </StatGrid>

          <div className="chart-grid">
            <section className="card">
              <BarChart title="Bookings per month" data={data.bookings.monthly.map((m) => ({ label: formatMonth(m.month), value: m.total }))} />
            </section>
            <section className="card">
              <BarChart title="Completed bookings per month" data={data.bookings.monthly.map((m) => ({ label: formatMonth(m.month), value: m.completed }))} />
            </section>
            <section className="card">
              <BarChart title="Cancelled bookings per month" data={data.bookings.monthly.map((m) => ({ label: formatMonth(m.month), value: m.cancelled }))} />
            </section>
            <section className="card">
              <BarChart title="New users per month" data={data.users.monthly.map((m) => ({ label: formatMonth(m.month), value: m.total }))} />
            </section>
          </div>

          <section className="stack">
            <h2>Most popular categories</h2>
            <DataTable
              caption="Categories by bookings"
              rowKey="categoryId"
              rows={data.categories.categories}
              columns={[
                { key: 'name', label: 'Category' },
                { key: 'bookings', label: 'Bookings', className: 'num' },
                { key: 'completed', label: 'Completed', className: 'num' },
                { key: 'revenue', label: 'Revenue', className: 'num', render: (r) => formatPKR(r.revenue) },
              ]}
            />
          </section>

          <section className="stack">
            <h2>Top providers</h2>
            {data.providers.topProviders.length === 0 ? (
              <p className="muted">No verified providers yet.</p>
            ) : (
              <DataTable
                caption="Provider performance"
                rowKey="providerId"
                rows={data.providers.topProviders}
                columns={[
                  { key: 'displayName', label: 'Provider', render: (r) => <strong>{r.displayName}</strong> },
                  { key: 'bookings', label: 'Bookings', className: 'num' },
                  { key: 'completed', label: 'Completed', className: 'num' },
                  { key: 'completionRate', label: 'Completion', className: 'num', render: (r) => `${r.completionRate}%` },
                  { key: 'cancelled', label: 'Cancelled', className: 'num' },
                  { key: 'ratingAverage', label: 'Rating', className: 'num', render: (r) => (r.ratingCount ? `${r.ratingAverage.toFixed(1)} (${r.ratingCount})` : '—') },
                  { key: 'earnings', label: 'Earnings', className: 'num', render: (r) => formatPKR(r.earnings) },
                ]}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
