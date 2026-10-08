import PageHeader from '../../components/common/PageHeader';
import UserTable from '../../components/dashboard/UserTable';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ManageCustomers() {
  useDocumentTitle('Customers');
  return (
    <div className="stack stack--lg">
      <PageHeader title="Customers" description="Customer accounts and their status." />
      <UserTable role="customer" />
    </div>
  );
}
