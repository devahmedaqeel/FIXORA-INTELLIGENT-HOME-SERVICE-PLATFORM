import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Loader from '../../components/common/Loader';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../features/auth/auth.context';
import { getPlatformConfig } from '../../services/catalog.service';

/** Support contacts come from admin-managed platform settings. */
export default function Contact() {
  useDocumentTitle('Contact');
  const { user } = useAuth();
  const { data, loading } = useAsync(getPlatformConfig, []);
  const complaintsPath = user && user.role !== 'admin' ? `/${user.role}/complaints` : null;

  return (
    <div className="container page-section section--narrow">
      <header className="prose-header">
        <p className="eyebrow">Support</p>
        <h1>We&apos;re here to help</h1>
        <p className="lead">Have a problem with a booking or a question about Fixora? Reach our support team.</p>
      </header>
      {loading ? (
        <Loader />
      ) : (
        <div className="contact-grid">
          <a className="card contact-card" href={`mailto:${data?.supportEmail}`}>
            <Icon name="mail" size={24} />
            <h2>Email</h2>
            <p>{data?.supportEmail}</p>
          </a>
          <a className="card contact-card" href={`tel:${data?.supportPhone?.replace(/\s/g, '')}`}>
            <Icon name="phone" size={24} />
            <h2>Phone</h2>
            <p>{data?.supportPhone}</p>
          </a>
          <div className="card contact-card">
            <Icon name="alert" size={24} />
            <h2>Raise a complaint</h2>
            <p>Track your ticket and our response from your dashboard.</p>
            {complaintsPath ? (
              <Button to={complaintsPath} size="sm">
                Open complaints
              </Button>
            ) : (
              <Button to="/login?redirect=/customer/complaints" size="sm" variant="secondary">
                Sign in to submit
              </Button>
            )}
          </div>
        </div>
      )}
      <p className="muted small center">Tip: the Fixora assistant on the home page can answer most questions instantly.</p>
    </div>
  );
}
