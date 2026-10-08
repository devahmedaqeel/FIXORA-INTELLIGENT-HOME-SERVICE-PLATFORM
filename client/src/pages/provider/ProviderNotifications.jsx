import NotificationsList from '../../components/dashboard/NotificationsList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ProviderNotifications() {
  useDocumentTitle('Notifications');
  return <NotificationsList />;
}
