import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
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

export default function ProviderBookings() {
  useDocumentTitle('Bookings');
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page')) || 1;
  const scope = status ? 'all' : params.get('scope') || 'upcoming';

  const { data, loading, error, reload } = useAsync(() => listMyBookings({ status, scope, page, limit: 10 }), [status, scope, page]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  return (
    <div className="stack stack--lg">
      <PageHeader title="Bookings" description="Accept new requests, manage upcoming jobs and mark work as completed." />
      <div className="toolbar">
        <Tabs
          value={status ? 'filtered' : scope}
          onChange={(v) => update({ scope: v, status: '' })}
          options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' },
            { value: 'all', label: 'All' },
          ]}
          label="Booking period"
        />
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
      {data?.items.length === 0 && <EmptyState icon="calendar" title="No bookings found." message="When customers book you, their requests appear here." />}
      <div className="stack">
        {data?.items.map((b) => (
          <BookingCard key={b.id} booking={b} perspective="provider" to={`/provider/bookings/${b.id}`} />
        ))}
      </div>
      <Pagination meta={data?.meta} onChange={(p) => update({ page: String(p) })} />
    </div>
  );
}
