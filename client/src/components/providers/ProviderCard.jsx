import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Icon from '../common/Icon';
import ProviderRating from './ProviderRating';
import ProviderVerificationBadge from './ProviderVerificationBadge';
import { formatPrice } from '../../utils/format';
import { providerDisplayName, serviceAreaSummary } from '../../features/providers/provider.utils';

/**
 * Search result / featured provider card.
 * `result` is a search item ({ provider, startingPrice, pricingType, primaryService, categoryNames })
 * or `provider` can be passed directly for simpler listings.
 */
export default function ProviderCard({ result, provider: providerProp, profilePath, bookPath, onSaveToggle, saved }) {
  const provider = result?.provider || providerProp;
  const name = providerDisplayName(provider);
  const price = result?.startingPrice ?? provider.minPrice;

  return (
    <article className="provider-card">
      <div className="provider-card__head">
        <Avatar src={provider.photoURL} name={name} size={56} />
        <div className="provider-card__title">
          <h3>
            <Link to={profilePath}>{name}</Link>
            {provider.isVerified && <ProviderVerificationBadge status="verified" compact />}
          </h3>
          {provider.businessName && <p className="muted small">{provider.displayName}</p>}
          <ProviderRating average={provider.ratingAverage} count={provider.ratingCount} />
        </div>
        {onSaveToggle && (
          <button
            type="button"
            className={`icon-btn save-btn ${saved ? 'is-saved' : ''}`}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
            onClick={() => onSaveToggle(provider.id, !saved)}
          >
            <Icon name="heart" />
          </button>
        )}
      </div>

      {result?.primaryService && (
        <p className="provider-card__service">
          <Icon name="briefcase" size={16} />
          <span>
            {result.primaryService.title}
            {result.serviceCount > 1 && <span className="muted"> +{result.serviceCount - 1} more</span>}
          </span>
        </p>
      )}
      {result?.categoryNames?.length > 0 && (
        <div className="chip-row">
          {result.categoryNames.map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
        </div>
      )}
      <p className="provider-card__area">
        <Icon name="map-pin" size={16} />
        <span>{serviceAreaSummary(provider) || 'Service areas not listed'}</span>
      </p>

      <div className="provider-card__footer">
        <div>
          <span className="muted small">Starting price</span>
          <p className="provider-card__price">{price != null ? formatPrice(price, result?.pricingType === 'hourly' ? 'hourly' : 'fixed') : '—'}</p>
        </div>
        <div className="row">
          <Button to={profilePath} variant="secondary" size="sm">
            View profile
          </Button>
          {bookPath && (
            <Button to={bookPath} size="sm">
              Book now
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
