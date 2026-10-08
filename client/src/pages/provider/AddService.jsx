import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ServiceForm from '../../components/providers/ServiceForm';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { createService } from '../../features/providers/provider.service';

export default function AddService() {
  useDocumentTitle('Add service');
  const navigate = useNavigate();
  const toast = useToast();
  return (
    <div className="stack stack--lg">
      <PageHeader title="Add a service" description="Set what you offer, how you charge and how long it usually takes." />
      <ServiceForm
        submitLabel="Create service"
        onSubmit={async (payload) => {
          await createService(payload);
          toast.success('Service created');
          navigate('/provider/services');
        }}
      />
    </div>
  );
}
