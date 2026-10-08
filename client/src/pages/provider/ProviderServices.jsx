import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { deleteService, listOwnServices, updateService } from '../../features/providers/provider.service';
import { formatDuration, formatPrice, pricingLabel } from '../../utils/format';

export default function ProviderServices() {
  useDocumentTitle('My services');
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(listOwnServices, []);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(null);

  const toggleActive = async (service) => {
    setBusy(service.id);
    try {
      const updated = await updateService(service.id, { active: !service.active });
      setData((list) => list.map((s) => (s.id === service.id ? updated : s)));
      toast.success(updated.active ? 'Service activated' : 'Service deactivated');
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(null);
    }
  };

  const confirmDelete = async () => {
    setBusy(toDelete.id);
    try {
      const result = await deleteService(toDelete.id);
      toast.success(result.archived ? 'Service has past bookings, so it was archived instead of deleted' : 'Service deleted');
      setData((list) => list.filter((s) => s.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader title="My services" description="Services and prices customers can book." actions={<Button to="/provider/services/new" icon="plus">Add service</Button>} />
      {loading && <Loader />}
      <ErrorMessage error={error} onRetry={reload} />
      {data?.length === 0 && (
        <EmptyState icon="briefcase" title="You haven't added any services yet." message="Add at least one service so customers can book you." action={<Button to="/provider/services/new">Add your first service</Button>} />
      )}
      <div className="card-grid">
        {data?.map((service) => (
          <article key={service.id} className={`card service-card ${service.active ? '' : 'is-inactive'}`}>
            <div className="row row--between">
              <Badge tone={service.active ? 'success' : 'neutral'}>{service.active ? 'Active' : 'Inactive'}</Badge>
              <span className="muted small">{service.categoryName}</span>
            </div>
            <h2 className="service-card__title">{service.title}</h2>
            {service.description && <p className="muted small clamp-2">{service.description}</p>}
            <p className="service-card__price">{formatPrice(service.price, service.pricingType)}</p>
            <p className="muted small">
              {pricingLabel(service.pricingType)} · {formatDuration(service.duration)}
            </p>
            <div className="row row--wrap service-card__actions">
              <Button to={`/provider/services/${service.id}/edit`} variant="secondary" size="sm" icon="edit">
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggleActive(service)} loading={busy === service.id}>
                {service.active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="ghost" size="sm" icon="trash" onClick={() => setToDelete(service)} aria-label={`Delete ${service.title}`} />
            </div>
          </article>
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete service?"
        message={`“${toDelete?.title}” will be removed. If it has past bookings it will be archived instead so your history stays intact.`}
        confirmLabel="Delete"
        loading={busy === toDelete?.id}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
