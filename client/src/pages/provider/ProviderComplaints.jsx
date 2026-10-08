import ComplaintsPanel from '../../components/dashboard/ComplaintsPanel';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ProviderComplaints() {
  useDocumentTitle('Complaints');
  return <ComplaintsPanel />;
}
