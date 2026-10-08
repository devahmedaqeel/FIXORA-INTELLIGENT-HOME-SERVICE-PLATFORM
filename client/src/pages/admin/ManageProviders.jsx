import PageHeader from '../../components/common/PageHeader';
import ProviderAdminTable from '../../components/dashboard/ProviderAdminTable';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ManageProviders() {
  useDocumentTitle('Providers');
  return (
    <div className="stack stack--lg">
      <PageHeader title="Providers" description="All service providers. Only verified providers appear in customer search." />
      <ProviderAdminTable />
    </div>
  );
}
