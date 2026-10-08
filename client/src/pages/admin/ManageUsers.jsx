import PageHeader from '../../components/common/PageHeader';
import UserTable from '../../components/dashboard/UserTable';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ManageUsers() {
  useDocumentTitle('Users');
  return (
    <div className="stack stack--lg">
      <PageHeader title="Users" description="All accounts on the platform. Suspend accounts that break the rules." />
      <UserTable />
    </div>
  );
}
