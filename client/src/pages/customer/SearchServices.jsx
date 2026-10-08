import SearchResultsView from '../../components/search/SearchResultsView';
import { useSavedProviders } from '../../hooks/useSavedProviders';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function SearchServices() {
  useDocumentTitle('Find services');
  const { savedIds, toggleSaved } = useSavedProviders();
  return (
    <SearchResultsView
      action="/customer/search"
      profilePathFor={(id) => `/customer/providers/${id}`}
      bookPathFor={(providerId, serviceId) => `/customer/book/${providerId}${serviceId ? `?serviceId=${serviceId}` : ''}`}
      savedIds={savedIds}
      onSaveToggle={toggleSaved}
    />
  );
}
