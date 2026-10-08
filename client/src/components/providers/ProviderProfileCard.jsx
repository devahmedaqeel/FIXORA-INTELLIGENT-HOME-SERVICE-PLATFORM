import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import ProviderRating from './ProviderRating';
import ProviderVerificationBadge from './ProviderVerificationBadge';
import { providerDisplayName } from '../../features/providers/provider.utils';
import { formatDate } from '../../utils/format';

/** Header block of a provider profile: photo, name, verification, stats and contact. */
export default function ProviderProfileCard({ provider, categories = [], actions }) {
  const name = providerDisplayName(provider);
  return (
    <section className="profile-hero card" aria-labelledby="provider-name">
      <Avatar src={provider.photoURL} name={name} size={96} />
      <div className="profile-hero__body">
        <div className="row row--wrap row--center">
          <h1 id="provider-name" className="profile-hero__name">
            {name}
          </h1>
          <ProviderVerificationBadge status={provider.verificationStatus} />
        </div>
        {provider.businessName && <p className="muted">{provider.displayName}</p>}
        <ProviderRating average={provider.ratingAverage} count={provider.ratingCount} size={16} />
        <ul className="profile-hero__facts">
          <li>
            <Icon name="check-circle" size={16} /> {provider.completedBookings || 0} completed job{provider.completedBookings === 1 ? '' : 's'}
          </li>
          {provider.experienceYears > 0 && (
            <li>
              <Icon name="briefcase" size={16} /> {provider.experienceYears} years experience
            </li>
          )}
          {provider.memberSince && (
            <li>
              <Icon name="calendar" size={16} /> On Fixora since {formatDate(provider.memberSince, { month: 'short', year: 'numeric' })}
            </li>
          )}
          {provider.phone && (
            <li>
              <Icon name="phone" size={16} /> <a href={`tel:${provider.phone}`}>{provider.phone}</a>
            </li>
          )}
        </ul>
        {categories.length > 0 && (
          <div className="chip-row">
            {categories.map((c) => (
              <span key={c.id} className="chip">
                {c.name}
              </span>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="profile-hero__actions">{actions}</div>}
    </section>
  );
}
