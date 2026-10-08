import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const SECTIONS = [
  {
    icon: 'users',
    title: 'For customers',
    points: [
      'Search by service category plus your area name or postcode.',
      'Compare verified providers by rating, reviews and starting price.',
      'Pick a free time slot — the system prevents overlapping bookings automatically.',
      'Track every booking from your dashboard and review the provider once the job is done.',
    ],
  },
  {
    icon: 'briefcase',
    title: 'For service providers',
    points: [
      'Create a profile with your photo, bio, categories and service areas.',
      'Add services with fixed, starting-from or hourly prices.',
      'Set weekly working hours and block out days off.',
      'Accept or decline requests, mark jobs complete and track your earnings.',
    ],
  },
  {
    icon: 'shield',
    title: 'How verification works',
    points: [
      'New providers start as “pending” and are hidden from search.',
      'Our team reviews the profile and any documents provided.',
      'Approved providers get a green Verified badge and become visible to customers.',
      'Providers who break our rules can be suspended at any time.',
    ],
  },
];

export default function About() {
  useDocumentTitle('How it works');
  return (
    <div className="container page-section">
      <header className="prose-header">
        <p className="eyebrow">About Fixora</p>
        <h1>A smarter way to get things fixed at home</h1>
        <p className="lead">
          Fixora connects households across the UK with verified local professionals — plumbers, electricians, cleaners, heating engineers,
          tutors and more — using simple area and postcode search instead of map apps.
        </p>
      </header>
      <div className="feature-grid feature-grid--3">
        {SECTIONS.map((section) => (
          <section key={section.title} className="card">
            <span className="feature__icon">
              <Icon name={section.icon} size={22} />
            </span>
            <h2 className="card__title">{section.title}</h2>
            <ul className="check-list">
              {section.points.map((p) => (
                <li key={p}>
                  <Icon name="check" size={16} />
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="row row--center row--wrap page-cta">
        <Button to="/search" icon="search">
          Find a provider
        </Button>
        <Button to="/register?role=provider" variant="secondary">
          Join as a provider
        </Button>
      </div>
    </div>
  );
}
