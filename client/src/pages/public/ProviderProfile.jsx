import { Navigate, useParams } from 'react-router-dom';
import ProviderProfileView from '../../components/providers/ProviderProfileView';
import Button from '../../components/common/Button';
import { useAuth } from '../../features/auth/auth.context';
import { bookingPathFor } from '../../features/booking/booking.utils';

/** Public provider profile at /providers/:id. */
export default function ProviderProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  if (user?.role === 'customer') return <Navigate to={`/customer/providers/${id}`} replace />;

  const bookPath = (serviceId) => bookingPathFor(user, id, serviceId);
  return (
    <div className="container page-section">
      <ProviderProfileView
        providerId={id}
        bookPathFor={user && user.role !== 'customer' ? null : bookPath}
        headerActions={
          !user ? (
            <Button to={bookPath()} icon="calendar">
              Sign in to book
            </Button>
          ) : null
        }
      />
    </div>
  );
}
