import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ServiceForm from '../../components/providers/ServiceForm';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { getOwnService, updateService } from '../../features/providers/provider.service';

export default function EditService() {
  useDocumentTitle('Edit service');
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => getOwnService(id), [id]);

  return (
    <div className="stack stack--lg">
      <PageHeader title="Edit service" />
      {loading && <Loader />}
      <ErrorMessage error={error} onRetry={reload} />
      {data && (
        <ServiceForm
          initial={data}
          onSubmit={async (payload) => {
            await updateService(id, payload);
            toast.success('Service updated');
            navigate('/provider/services');
          }}
        />
      )}
    </div>
  );
}
