import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import BookingForm from '../../components/booking/BookingForm';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../features/auth/auth.context';
import { getProviderProfile } from '../../features/providers/provider.service';
import { providerDisplayName } from '../../features/providers/provider.utils';

export default function BookingPage() {
  useDocumentTitle('Book a service');
  const { providerId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => getProviderProfile(providerId), [providerId]);

  if (loading) return <Loader label="Loading booking options…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow="New booking"
        title={`Book ${providerDisplayName(data.provider)}`}
        description={
          <>
            Choose a service and a free time slot. <Link to={`/customer/providers/${providerId}`}>View full profile</Link>
          </>
        }
      />
      {data.services.length === 0 ? (
        <EmptyState icon="briefcase" title="This provider has no bookable services right now." />
      ) : (
        <BookingForm
          profile={data}
          initialServiceId={params.get('serviceId')}
          customer={user}
          onBooked={(booking) => navigate(`/customer/bookings/${booking.id}`, { replace: true })}
        />
      )}
    </div>
  );
}
