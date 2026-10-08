import PageHeader from '../../components/common/PageHeader';
import ProviderAdminTable from '../../components/dashboard/ProviderAdminTable';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ProviderVerification() {
  useDocumentTitle('Provider verification');
  return (
    <div className="stack stack--lg">
      <PageHeader title="Provider verification" description="Review new providers' profiles, services and documents, then approve or reject them." />
      <ProviderAdminTable initialStatus="pending" lockStatus />
    </div>
  );
}
