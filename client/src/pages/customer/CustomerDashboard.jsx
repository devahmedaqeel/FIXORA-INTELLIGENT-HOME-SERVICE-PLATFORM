import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import StatCard, { StatGrid } from '../../components/dashboard/StatCard';
import BookingCard from '../../components/booking/BookingCard';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import ProviderCard from '../../components/providers/ProviderCard';
import ReviewCard from '../../components/reviews/ReviewCard';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../features/auth/auth.context';
import { getCustomerDashboard } from '../../services/account.service';
import { timeAgo } from '../../utils/format';

export default function CustomerDashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(getCustomerDashboard, []);

  if (loading) return <Loader label="Loading your dashboard…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  const { stats } = data;
  const firstName = user.displayName.split(' ')[0];

  return (
    <div className="stack stack--xl">
      <PageHeader
        eyebrow="Customer dashboard"
        title={`Hello, ${firstName}`}
        description="Here is what is happening with your bookings."
        actions={<Button to="/customer/search" icon="search">Book a service</Button>}
      />

      <StatGrid>
        <StatCard label="Upcoming bookings" value={stats.upcoming} icon="calendar" to="/customer/bookings?scope=upcoming" />
        <StatCard label="Active bookings" value={stats.active} icon="clock" tone="accent" to="/customer/bookings?status=in_progress" />
        <StatCard label="Completed" value={stats.completed} icon="check-circle" tone="success" to="/customer/bookings?status=completed" />
        <StatCard label="Cancelled" value={stats.cancelled} icon="x" tone="neutral" to="/customer/bookings?status=cancelled" />
      </StatGrid>

      {stats.awaitingReview > 0 && (
        <div className="notice notice--info row row--between row--wrap">
          <p>
            You have {stats.awaitingReview} completed booking{stats.awaitingReview > 1 ? 's' : ''} waiting for a review.
          </p>
          <Button to="/customer/reviews" size="sm" variant="secondary">
            Leave a review
          </Button>
        </div>
      )}

      <div className="dash-columns">
        <section className="stack" aria-labelledby="upcoming-heading">
          <div className="section__head">
            <h2 id="upcoming-heading">Upcoming appointments</h2>
            <Link to="/customer/bookings" className="small">
              View all
            </Link>
          </div>
          {data.upcomingBookings.length === 0 ? (
            <EmptyState icon="calendar" title="No upcoming bookings." action={<Button to="/customer/search" size="sm">Find a provider</Button>} />
          ) : (
            data.upcomingBookings.map((b) => <BookingCard key={b.id} booking={b} to={`/customer/bookings/${b.id}`} />)
          )}
        </section>

        <section className="card" aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="card__title">
            Recent activity
          </h2>
          {data.recentActivity.length === 0 ? (
            <p className="muted">No activity yet.</p>
          ) : (
            <ul className="activity-list">
              {data.recentActivity.map((a) => (
                <li key={a.bookingId}>
                  <Link to={`/customer/bookings/${a.bookingId}`}>{a.serviceTitle}</Link>
                  <span className="muted small"> with {a.providerName}</span>
                  <div className="row row--between">
                    <BookingStatusBadge status={a.status} />
                    <span className="muted small">{timeAgo(a.updatedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="saved-heading" className="stack">
        <div className="section__head">
          <h2 id="saved-heading">Saved providers</h2>
          <Link to="/customer/saved" className="small">
            Manage
          </Link>
        </div>
        {data.savedProviders.length === 0 ? (
          <p className="muted">Tap the heart on any provider to save them here.</p>
        ) : (
          <div className="card-grid">
            {data.savedProviders.map((p) => (
              <ProviderCard key={p.id} provider={p} profilePath={`/customer/providers/${p.id}`} bookPath={`/customer/book/${p.id}`} />
            ))}
          </div>
        )}
      </section>

      {data.recommendedProviders.length > 0 && (
        <section aria-labelledby="recommended-heading" className="stack">
          <h2 id="recommended-heading">Recommended for you</h2>
          <div className="card-grid">
            {data.recommendedProviders.map((p) => (
              <ProviderCard key={p.id} provider={p} profilePath={`/customer/providers/${p.id}`} bookPath={`/customer/book/${p.id}`} />
            ))}
          </div>
        </section>
      )}

      {data.recentReviews.length > 0 && (
        <section aria-labelledby="reviews-heading" className="stack">
          <h2 id="reviews-heading">Your recent reviews</h2>
          <div className="card-grid">
            {data.recentReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
