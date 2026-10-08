import ComplaintsPanel from '../../components/dashboard/ComplaintsPanel';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function CustomerComplaints() {
  useDocumentTitle('Complaints');
  return <ComplaintsPanel />;
}
