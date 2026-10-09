import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import DataTable from '../../components/common/DataTable';
import StatCard, { StatGrid } from '../../components/dashboard/StatCard';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getFinancialReports } from '../../services/finance.service';
import { formatGBP } from '../../utils/format';

export default function AdminFinancialReports() {
  useDocumentTitle('Financial reports');
  const { data, loading, error, reload } = useAsync(getFinancialReports, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;
  const { totals, topProviders } = data;

  return (
    <div className="stack stack--xl">
      <PageHeader title="Financial reports" description="Platform-wide commission revenue and outstanding balances." />
      <StatGrid>
        <StatCard label="Total commission generated" value={formatGBP(totals.totalCommissionGBP)} icon="wallet" tone="accent" />
        <StatCard label="Collected" value={formatGBP(totals.totalCollectedGBP)} icon="check-circle" tone="success" />
        <StatCard label="Outstanding" value={formatGBP(totals.totalOutstandingGBP)} icon="alert" tone="warning" />
        <StatCard label="Due" value={totals.dueCount} icon="clock" to="/admin/commissions?status=due" />
        <StatCard label="Overdue" value={totals.overdueCount} icon="alert" tone="danger" to="/admin/commissions?status=overdue" />
        <StatCard label="Under review" value={totals.underReviewCount} icon="file" tone="info" to="/admin/commissions?status=under_review" />
        <StatCard label="Paid" value={totals.paidCount} icon="check-circle" tone="success" />
        <StatCard label="Disputed" value={totals.disputedCount} icon="alert" tone="danger" to="/admin/commissions?status=disputed" />
        <StatCard label="Waived" value={totals.waivedCount} icon="file" tone="neutral" />
      </StatGrid>

      <section className="stack">
        <h2>Top providers by commission</h2>
        {topProviders.length === 0 ? (
          <EmptyState icon="briefcase" title="No commission activity yet." />
        ) : (
          <DataTable
            caption="Top providers by commission"
            rows={topProviders}
            rowKey="providerId"
            columns={[
              { key: 'providerName', label: 'Provider' },
              { key: 'totalCommissionGBP', label: 'Total commission', className: 'num', render: (p) => formatGBP(p.totalCommissionGBP) },
              { key: 'paidGBP', label: 'Paid', className: 'num', render: (p) => formatGBP(p.paidGBP) },
              { key: 'outstandingGBP', label: 'Outstanding', className: 'num', render: (p) => formatGBP(p.outstandingGBP) },
            ]}
          />
        )}
      </section>
    </div>
  );
}
