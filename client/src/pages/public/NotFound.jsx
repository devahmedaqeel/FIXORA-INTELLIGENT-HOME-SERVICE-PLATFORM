import Button from '../../components/common/Button';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container page-section center status-page">
      <p className="status-page__code">404</p>
      <h1>We couldn&apos;t find that page</h1>
      <p className="muted">The link may be broken or the page may have moved.</p>
      <div className="row row--center">
        <Button to="/">Go home</Button>
        <Button to="/search" variant="secondary">
          Find a provider
        </Button>
      </div>
    </div>
  );
}
