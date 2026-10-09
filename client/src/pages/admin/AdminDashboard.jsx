import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/common/DataTable';
import StatCard, { StatGrid } from '../../components/dashboard/StatCard';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getAdminDashboard } from '../../services/admin.service';
import { formatDate, formatGBP, timeAgo } from '../../utils/format';

export default function AdminDashboard() {
  useDocumentTitle('Admin dashboard');
  const { data, loading, error, reload } = useAsync(getAdminDashboard, []);
  if (loading) return <Loader label="Loading platform overview…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;
  const s = data.stats;
  const f = data.financial;

  return (
    <div className="stack stack--xl">
      <PageHeader eyebrow="Administration" title="Platform overview" actions={<Button to="/admin/reports" icon="chart" variant="secondary">Reports</Button>} />
      <StatGrid>
        <StatCard label="Total users" value={s.totalUsers} icon="users" to="/admin/users" />
        <StatCard label="Customers" value={s.totalCustomers} icon="user" to="/admin/customers" />
        <StatCard label="Providers" value={s.totalProviders} icon="briefcase" to="/admin/providers" />
        <StatCard label="Verified providers" value={s.verifiedProviders} icon="shield" tone="success" to="/admin/providers" />
        <StatCard label="Pending verification" value={s.pendingProviders} icon="clock" tone="warning" to="/admin/provider-verification" />
        <StatCard label="Total bookings" value={s.totalBookings} icon="calendar" to="/admin/bookings" />
        <StatCard label="Completed bookings" value={s.completedBookings} icon="check-circle" tone="success" />
        <StatCard label="Cancelled bookings" value={s.cancelledBookings} icon="x" tone="neutral" />
        <StatCard label="Reviews" value={s.totalReviews} icon="star" to="/admin/reviews" />
        <StatCard label="Open complaints" value={s.openComplaints} hint={`${s.totalComplaints} total`} icon="alert" tone="danger" to="/admin/complaints" />
        <StatCard label="Unanswered chatbot queries" value={s.unansweredQueries} icon="message" tone="warning" to="/admin/chatbot-queries" />
      </StatGrid>

      <div className="section__head">
        <h2>Financial overview</h2>
        <Link to="/admin/financial-reports" className="small">
          Full report
        </Link>
      </div>
      <StatGrid>
        <StatCard label="Total commission generated" value={formatGBP(f.totalCommissionGBP)} icon="wallet" tone="accent" to="/admin/commissions" />
        <StatCard label="Collected" value={formatGBP(f.totalCollectedGBP)} icon="check-circle" tone="success" />
        <StatCard label="Outstanding" value={formatGBP(f.totalOutstandingGBP)} icon="alert" tone="warning" to="/admin/commissions?status=due" />
        <StatCard label="Overdue" value={f.overdueCount} icon="alert" tone="danger" to="/admin/commissions?status=overdue" />
        <StatCard label="Awaiting verification" value={f.underReviewCount} icon="file" tone="info" to="/admin/commissions?status=under_review" />
        <StatCard label="Disputed payments/commissions" value={f.disputedCount} icon="alert" tone="danger" to="/admin/payments?status=disputed" />
      </StatGrid>

      <div className="dash-columns">
        <section className="stack">
          <div className="section__head">
            <h2>Recent bookings</h2>
            <Link to="/admin/bookings" className="small">
              View all
            </Link>
          </div>
          {data.recentBookings.length === 0 ? (
            <p className="muted">No bookings yet.</p>
          ) : (
            <DataTable
              caption="Recent bookings"
              rows={data.recentBookings}
              columns={[
                { key: 'serviceTitle', label: 'Service' },
                { key: 'customerName', label: 'Customer' },
                { key: 'providerName', label: 'Provider' },
                { key: 'bookingDate', label: 'Date', render: (b) => formatDate(b.bookingDate) },
                { key: 'status', label: 'Status', render: (b) => <BookingStatusBadge status={b.status} /> },
              ]}
            />
          )}
        </section>
        <section className="card">
          <h2 className="card__title">Verification queue</h2>
          {data.pendingProviders.length === 0 ? (
            <p className="muted">No providers waiting. 🎉</p>
          ) : (
            <ul className="activity-list">
              {data.pendingProviders.map((p) => (
                <li key={p.id}>
                  <strong>{p.businessName || p.displayName}</strong>
                  <span className="muted small"> · joined {timeAgo(p.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
          <Button to="/admin/provider-verification" size="sm" variant="secondary">
            Review providers
          </Button>
        </section>
      </div>
    </div>
  );
}
