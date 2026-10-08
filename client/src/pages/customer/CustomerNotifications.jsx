import NotificationsList from '../../components/dashboard/NotificationsList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function CustomerNotifications() {
  useDocumentTitle('Notifications');
  return <NotificationsList />;
}
