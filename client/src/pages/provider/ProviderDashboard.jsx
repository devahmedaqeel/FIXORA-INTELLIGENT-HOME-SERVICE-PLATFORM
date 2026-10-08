import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Icon from '../../components/common/Icon';
import StatCard, { StatGrid } from '../../components/dashboard/StatCard';
import BookingCard from '../../components/booking/BookingCard';
import BarChart from '../../components/charts/BarChart';
import ProviderVerificationBadge from '../../components/providers/ProviderVerificationBadge';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../features/auth/auth.context';
import { getProviderDashboard } from '../../features/providers/provider.service';
import { profileChecklist } from '../../features/providers/provider.utils';
import { formatMonth, formatPKR } from '../../utils/format';

function VerificationBanner({ status, note, provider }) {
  if (status === 'verified') return null;
  const checklist = profileChecklist(provider);
  const messages = {
    pending: 'Your provider verification is pending. Complete your profile so our team can approve you — you will not appear in search until then.',
    rejected: 'Your verification was not approved. Update your profile or documents and save to resubmit.',
    suspended: 'Your account is suspended and hidden from search. Contact support for help.',
  };
  return (
    <section className={`notice ${status === 'pending' ? 'notice--warning' : 'notice--danger'} verification-banner`}>
      <Icon name="shield" size={22} />
      <div className="stack stack--sm">
        <div className="row row--wrap">
          <strong>Verification status:</strong> <ProviderVerificationBadge status={status} />
        </div>
        <p>{messages[status]}</p>
        {note && <p className="small">Admin note: {note}</p>}
        {status !== 'suspended' && (
          <ul className="checklist">
            {checklist.map((item) => (
              <li key={item.label} className={item.done ? 'is-done' : ''}>
                <Icon name={item.done ? 'check-circle' : 'info'} size={16} /> {item.label}
              </li>
            ))}
          </ul>
        )}
        <div>
          <Button to="/provider/profile" size="sm" variant="secondary">
            Complete profile
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function ProviderDashboard() {
  useDocumentTitle('Provider dashboard');
  const { user, provider } = useAuth();
  const { data, loading, error, reload } = useAsync(getProviderDashboard, []);

  if (loading) return <Loader label="Loading your dashboard…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;
  const { stats } = data;

  return (
    <div className="stack stack--xl">
      <PageHeader
        eyebrow="Provider dashboard"
        title={`Welcome, ${user.displayName.split(' ')[0]}`}
        actions={
          <>
            <Button to="/provider/services/new" icon="plus">
              Add service
            </Button>
            <Button to="/provider/availability" variant="secondary" icon="clock">
              Availability
            </Button>
          </>
        }
      />

      <VerificationBanner status={data.verificationStatus} note={data.verificationNote} provider={{ ...provider, activeServiceCount: stats.activeServices }} />

      <StatGrid>
        <StatCard label="Pending requests" value={stats.pending} icon="inbox" tone="warning" to="/provider/bookings?status=pending" />
        <StatCard label="Confirmed" value={stats.confirmed} icon="calendar" to="/provider/bookings?status=confirmed" />
        <StatCard label="Completed" value={stats.completed} icon="check-circle" tone="success" to="/provider/bookings?status=completed" />
        <StatCard label="Total earnings" value={formatPKR(stats.totalEarnings)} icon="wallet" tone="accent" to="/provider/earnings" />
        <StatCard
          label="Average rating"
          value={stats.ratingCount ? stats.ratingAverage.toFixed(1) : '—'}
          hint={`${stats.ratingCount} review${stats.ratingCount === 1 ? '' : 's'}`}
          icon="star"
          to="/provider/reviews"
        />
        <StatCard label="Active services" value={stats.activeServices} icon="briefcase" to="/provider/services" />
      </StatGrid>

      <div className="dash-columns">
        <section className="stack" aria-labelledby="upcoming-heading">
          <div className="section__head">
            <h2 id="upcoming-heading">Upcoming & pending</h2>
            <Link to="/provider/bookings" className="small">
              View all
            </Link>
          </div>
          {data.upcomingBookings.length === 0 ? (
            <EmptyState icon="calendar" title="No upcoming bookings." message="New requests will appear here." />
          ) : (
            data.upcomingBookings.map((b) => <BookingCard key={b.id} booking={b} perspective="provider" to={`/provider/bookings/${b.id}`} />)
          )}
        </section>
        <section className="card" aria-labelledby="popular-heading">
          <h2 id="popular-heading" className="card__title">
            Service popularity
          </h2>
          {data.servicePopularity.length === 0 ? (
            <p className="muted">No bookings yet.</p>
          ) : (
            <ul className="bar-list">
              {data.servicePopularity.map((s) => (
                <li key={s.serviceId}>
                  <div className="row row--between">
                    <span>{s.title}</span>
                    <strong>{s.count}</strong>
                  </div>
                  <span className="bar-list__track">
                    <span className="bar-list__fill" style={{ width: `${(s.count / data.servicePopularity[0].count) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="chart-grid">
        <section className="card">
          <BarChart title="Bookings per month" data={data.monthly.map((m) => ({ label: formatMonth(m.month), value: m.bookings }))} />
        </section>
        <section className="card">
          <BarChart title="Earnings per month" formatValue={formatPKR} data={data.monthly.map((m) => ({ label: formatMonth(m.month), value: m.earnings }))} />
        </section>
      </div>
    </div>
  );
}
