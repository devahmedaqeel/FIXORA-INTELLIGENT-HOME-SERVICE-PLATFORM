import ProviderProfileCard from './ProviderProfileCard';
import WeeklySchedule from './WeeklySchedule';
import ReviewCard from '../reviews/ReviewCard';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import Icon from '../common/Icon';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getProviderProfile } from '../../features/providers/provider.service';
import { providerDisplayName } from '../../features/providers/provider.utils';
import { formatDuration, formatPrice } from '../../utils/format';

/**
 * Full public provider profile, shared by the public page and the customer dashboard.
 * bookPathFor(serviceId) decides where "Book" goes (login redirect for guests).
 */
export default function ProviderProfileView({ providerId, bookPathFor, headerActions }) {
  const { data, loading, error, reload } = useAsync(() => getProviderProfile(providerId), [providerId]);
  useDocumentTitle(data ? providerDisplayName(data.provider) : 'Provider');

  if (loading) return <Loader label="Loading provider profile…" />;
  if (error) return <ErrorMessage error={error} title="Could not load this provider" onRetry={reload} />;

  const { provider, services, categories, reviews, availability } = data;

  return (
    <div className="profile-layout">
      <ProviderProfileCard provider={provider} categories={categories} actions={headerActions} />

      <div className="profile-columns">
        <div className="stack stack--lg">
          {(provider.bio || provider.specializations?.length > 0) && (
            <section className="card stack" aria-labelledby="about-heading">
              <h2 id="about-heading" className="card__title">
                About
              </h2>
              {provider.bio && <p className="prewrap">{provider.bio}</p>}
              {provider.specializations?.length > 0 && (
                <div className="chip-row" aria-label="Specializations">
                  {provider.specializations.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="card" aria-labelledby="services-heading">
            <h2 id="services-heading" className="card__title">
              Services & prices
            </h2>
            {services.length === 0 ? (
              <EmptyState icon="briefcase" title="No services listed yet." />
            ) : (
              <ul className="service-list">
                {services.map((service) => (
                  <li key={service.id} className="service-list__item">
                    <div>
                      <p className="service-list__title">{service.title}</p>
                      <p className="muted small">
                        {service.categoryName} · {formatDuration(service.duration)}
                      </p>
                      {service.description && <p className="small">{service.description}</p>}
                    </div>
                    <div className="service-list__side">
                      <p className="service-list__price">{formatPrice(service.price, service.pricingType)}</p>
                      {bookPathFor && (
                        <Button to={bookPathFor(service.id)} size="sm">
                          Book
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="card__title">
              Reviews <span className="muted">({provider.ratingCount})</span>
            </h2>
            {reviews.length === 0 ? (
              <EmptyState icon="star" title="No reviews yet." message="Reviews appear after customers complete a booking." />
            ) : (
              <div className="stack">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="stack stack--lg">
          <section className="card" aria-labelledby="areas-heading">
            <h2 id="areas-heading" className="card__title">
              Service areas
            </h2>
            {provider.serviceAreas.length === 0 ? (
              <p className="muted">No service areas listed.</p>
            ) : (
              <ul className="area-list">
                {provider.serviceAreas.map((area) => (
                  <li key={area.id}>
                    <Icon name="map-pin" size={16} />
                    <span>
                      {area.areaName}, {area.city} <span className="muted">· {area.postalCode}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {provider.serviceRadiusKm > 0 && (
              <p className="muted small">Also travels up to {provider.serviceRadiusKm} km beyond these areas.</p>
            )}
          </section>
          <section className="card" aria-labelledby="hours-heading">
            <h2 id="hours-heading" className="card__title">
              Working hours
            </h2>
            <WeeklySchedule weekly={availability.weekly} />
            {availability.exceptions.length > 0 && (
              <p className="muted small">Unavailable on {availability.exceptions.length} upcoming date(s).</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
