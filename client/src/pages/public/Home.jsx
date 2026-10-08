import { Link } from 'react-router-dom';
import SearchBar from '../../components/search/SearchBar';
import ProviderCard from '../../components/providers/ProviderCard';
import ReviewCard from '../../components/reviews/ReviewCard';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { SkeletonCards } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAsync } from '../../hooks/useAsync';
import { useCategories } from '../../hooks/useCategories';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../features/auth/auth.context';
import { getFeaturedProviders, getRecentReviews } from '../../features/providers/provider.service';
import { bookingPathFor } from '../../features/booking/booking.utils';
import { categoryIcon } from '../../constants/categoryIcons';

const STEPS = [
  { icon: 'search', title: 'Search your area', text: 'Pick a service and enter your area or 5-digit postal code.' },
  { icon: 'shield', title: 'Compare verified pros', text: 'Every provider is checked by our team. Compare ratings, reviews and prices.' },
  { icon: 'calendar', title: 'Book a time slot', text: 'Choose a free slot that suits you. No double bookings — ever.' },
  { icon: 'star', title: 'Get it done & review', text: 'Pay after the job and rate your provider to help others.' },
];

const REASONS = [
  { icon: 'shield', title: 'Verified professionals', text: 'Providers are hidden from search until our team verifies them.' },
  { icon: 'map-pin', title: 'Truly local', text: 'Search by neighbourhood or postal code across Pakistan — no map apps needed.' },
  { icon: 'wallet', title: 'Clear prices', text: 'Fixed, starting-from or hourly rates shown upfront in rupees.' },
  { icon: 'clock', title: 'Flexible cancellation', text: 'Cancel free of charge before the cutoff time shown on your booking.' },
];

const FAQ = [
  ['How are providers verified?', 'Our team reviews every provider’s profile and documents before they can appear in search. Verified providers carry a green badge.'],
  ['Which areas does Fixora cover?', 'We list neighbourhoods and postal codes across Punjab, Sindh, KP, Balochistan, Islamabad, AJK and Gilgit-Baltistan. Search by your area name or 5-digit postal code.'],
  ['How do I pay?', 'By default you pay the provider in cash once the job is done. Prices are shown before you book.'],
  ['Can I cancel a booking?', 'Yes. Cancellations are free up to the cutoff time before the appointment (2 hours by default). Later cancellations show a warning first.'],
  ['I am a professional. How do I join?', 'Create a provider account, complete your profile, add your services and areas, and our team will verify you.'],
];

export default function Home() {
  useDocumentTitle();
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const featured = useAsync(getFeaturedProviders, []);
  const reviews = useAsync(getRecentReviews, []);

  const profilePath = (id) => (user?.role === 'customer' ? `/customer/providers/${id}` : `/providers/${id}`);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <p className="eyebrow eyebrow--light">Home services across Pakistan</p>
          <h1 className="hero__title">
            Reliable pros for every fix, <span className="hero__accent">booked in minutes.</span>
          </h1>
          <p className="hero__subtitle">Plumbers, electricians, cleaners, AC technicians, tutors and more — verified, rated and available in your area.</p>
          <SearchBar action={user?.role === 'customer' ? '/customer/search' : '/search'} />
          <p className="hero__hint">
            Try <Link to="/search?postalCode=10250">10250</Link> for New Mirpur City, or browse <Link to="/services">all services</Link>.
          </p>
        </div>
      </section>

      <section className="section container" aria-labelledby="popular-heading">
        <div className="section__head">
          <h2 id="popular-heading">Popular services</h2>
          <Link to="/services" className="link-arrow">
            All services <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        {categoriesLoading ? (
          <SkeletonCards count={4} />
        ) : (
          <div className="category-grid">
            {categories.slice(0, 12).map((category) => (
              <Link key={category.id} to={`/search?categoryId=${category.id}`} className="category-tile">
                <span className="category-tile__icon">
                  <Icon name={categoryIcon(category.icon)} size={26} />
                </span>
                <span className="category-tile__name">{category.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section section--tint" aria-labelledby="how-heading">
        <div className="container">
          <div className="section__head section__head--center">
            <h2 id="how-heading">How Fixora works</h2>
          </div>
          <ol className="steps">
            {STEPS.map((step, index) => (
              <li key={step.title} className="step">
                <span className="step__num">{index + 1}</span>
                <Icon name={step.icon} size={26} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section container" aria-labelledby="featured-heading">
        <div className="section__head">
          <h2 id="featured-heading">Featured verified providers</h2>
          <Link to="/search" className="link-arrow">
            Find more <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        {featured.loading && <SkeletonCards count={3} />}
        <ErrorMessage error={featured.error} onRetry={featured.reload} />
        {featured.data?.length === 0 && <EmptyState icon="users" title="Providers are joining soon." message="Check back shortly or become one of the first." />}
        {featured.data?.length > 0 && (
          <div className="card-grid">
            {featured.data.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} profilePath={profilePath(provider.id)} bookPath={bookingPathFor(user, provider.id)} />
            ))}
          </div>
        )}
      </section>

      <section className="section section--tint" aria-labelledby="why-heading">
        <div className="container">
          <div className="section__head section__head--center">
            <h2 id="why-heading">Why choose Fixora</h2>
          </div>
          <div className="feature-grid">
            {REASONS.map((reason) => (
              <div key={reason.title} className="feature">
                <span className="feature__icon">
                  <Icon name={reason.icon} size={22} />
                </span>
                <h3>{reason.title}</h3>
                <p>{reason.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {reviews.data?.length > 0 && (
        <section className="section container" aria-labelledby="reviews-heading">
          <div className="section__head">
            <h2 id="reviews-heading">What customers say</h2>
          </div>
          <div className="card-grid">
            {reviews.data.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="cta-band">
          <div>
            <h2>Are you a skilled professional?</h2>
            <p>Join Fixora, get verified and receive bookings from customers in your area.</p>
          </div>
          <Button to="/register?role=provider" variant="accent" size="lg" iconRight="arrow-right">
            Become a provider
          </Button>
        </div>
      </section>

      <section className="section container section--narrow" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="section__title-center">
          Frequently asked questions
        </h2>
        <div className="faq">
          {FAQ.map(([q, a]) => (
            <details key={q} className="faq__item">
              <summary>
                {q}
                <Icon name="chevron-down" size={18} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
