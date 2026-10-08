import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { SkeletonCards } from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import ProviderCard from '../../components/providers/ProviderCard';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { listSavedProviders, unsaveProvider } from '../../services/account.service';

export default function SavedProviders() {
  useDocumentTitle('Saved providers');
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(listSavedProviders, []);

  const remove = async (id) => {
    try {
      await unsaveProvider(id);
      setData((list) => list.filter((p) => p.id !== id));
      toast.success('Removed from saved providers');
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader title="Saved providers" description="Your shortlist for quick re-booking." />
      {loading && <SkeletonCards />}
      <ErrorMessage error={error} onRetry={reload} />
      {data?.length === 0 && (
        <EmptyState icon="heart" title="No saved providers yet." message="Tap the heart on a provider to save them." action={<Button to="/customer/search">Find providers</Button>} />
      )}
      {data?.length > 0 && (
        <div className="card-grid">
          {data.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              profilePath={`/customer/providers/${p.id}`}
              bookPath={`/customer/book/${p.id}`}
              saved
              onSaveToggle={(id) => remove(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
