import { useParams } from 'react-router-dom';
import ProviderProfileView from '../../components/providers/ProviderProfileView';
import Button from '../../components/common/Button';
import { useSavedProviders } from '../../hooks/useSavedProviders';

export default function ProviderDetails() {
  const { id } = useParams();
  const { savedIds, toggleSaved } = useSavedProviders();
  const saved = savedIds.includes(id);

  return (
    <ProviderProfileView
      providerId={id}
      bookPathFor={(serviceId) => `/customer/book/${id}?serviceId=${serviceId}`}
      headerActions={
        <>
          <Button to={`/customer/book/${id}`} icon="calendar">
            Book now
          </Button>
          <Button variant="secondary" icon="heart" onClick={() => toggleSaved(id, !saved)} aria-pressed={saved}>
            {saved ? 'Saved' : 'Save'}
          </Button>
        </>
      }
    />
  );
}
