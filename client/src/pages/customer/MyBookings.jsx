import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import BookingCard from '../../components/booking/BookingCard';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { listMyBookings } from '../../features/booking/booking.service';
import { BOOKING_FILTERS } from '../../features/booking/booking.constants';
import { canReview } from '../../features/booking/booking.utils';

const SCOPES = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All' },
];

export default function MyBookings() {
  useDocumentTitle('My bookings');
  const [params, setParams] = useSearchParams();
  const scope = params.get('scope') || (params.get('status') ? 'all' : 'upcoming');
  const status = params.get('status') || '';
  const page = Number(params.get('page')) || 1;

  const { data, loading, error, reload } = useAsync(() => listMyBookings({ scope, status, page, limit: 10 }), [scope, status, page]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  return (
    <div className="stack stack--lg">
      <PageHeader title="My bookings" actions={<Button to="/customer/search" icon="plus">New booking</Button>} />
      <div className="toolbar">
        <Tabs value={scope} onChange={(v) => update({ scope: v })} options={SCOPES} label="Booking period" />
        <select className="field__control toolbar__select" value={status} onChange={(e) => update({ status: e.target.value })} aria-label="Filter by status">
          {BOOKING_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      {loading && <Loader />}
      <ErrorMessage error={error} onRetry={reload} />
      {data?.items.length === 0 && (
        <EmptyState icon="calendar" title="No bookings found." message="Bookings you make will appear here." action={<Button to="/customer/search">Find a provider</Button>} />
      )}
      <div className="stack">
        {data?.items.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            to={`/customer/bookings/${booking.id}`}
            actions={
              canReview(booking) ? (
                <Button to={`/customer/bookings/${booking.id}#review`} size="sm" variant="secondary" icon="star">
                  Review
                </Button>
              ) : null
            }
          />
        ))}
      </div>
      <Pagination meta={data?.meta} onChange={(p) => update({ page: String(p) })} />
    </div>
  );
}
