import { Navigate, useLocation } from 'react-router-dom';
import SearchResultsView from '../../components/search/SearchResultsView';
import { useAuth } from '../../features/auth/auth.context';
import { bookingPathFor } from '../../features/booking/booking.utils';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/** Public search. Signed-in customers are moved to the dashboard version (saved providers etc.). */
export default function ServiceSearch() {
  useDocumentTitle('Find a provider');
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role === 'customer') return <Navigate to={`/customer/search${location.search}`} replace />;

  return (
    <div className="container page-section">
      <SearchResultsView
        action="/search"
        profilePathFor={(id) => `/providers/${id}`}
        bookPathFor={(providerId, serviceId) => bookingPathFor(user, providerId, serviceId)}
      />
    </div>
  );
}
