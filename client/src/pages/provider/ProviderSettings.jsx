import PageHeader from '../../components/common/PageHeader';
import AccountSettings from '../../components/dashboard/AccountSettings';
import Button from '../../components/common/Button';
import ProviderVerificationBadge from '../../components/providers/ProviderVerificationBadge';
import { useAuth } from '../../features/auth/auth.context';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ProviderSettings() {
  useDocumentTitle('Settings');
  const { provider, user } = useAuth();
  return (
    <div className="stack stack--xl narrow-page">
      <PageHeader title="Settings" description="Manage your account, security and public listing." />
      <section className="card stack">
        <h2 className="card__title">Public listing</h2>
        <div className="row row--between row--wrap">
          <div>
            <p className="strong">Verification</p>
            <ProviderVerificationBadge status={provider?.verificationStatus} />
          </div>
          <div className="row row--wrap">
            <Button to={`/providers/${user.uid}`} variant="secondary" size="sm" icon="external">
              View public profile
            </Button>
            <Button to="/provider/profile" size="sm" icon="edit">
              Edit profile
            </Button>
          </div>
        </div>
      </section>
      <AccountSettings />
    </div>
  );
}
