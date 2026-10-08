import { Link } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import { SkeletonCards } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useCategories } from '../../hooks/useCategories';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { categoryIcon } from '../../constants/categoryIcons';

/** All active service categories (loaded from Firestore via the API). */
export default function Services() {
  useDocumentTitle('Services');
  const { categories, loading, error } = useCategories();

  return (
    <div className="container page-section">
      <header className="prose-header">
        <p className="eyebrow">Services</p>
        <h1>What do you need help with?</h1>
        <p className="lead">Choose a category to see verified providers near you.</p>
      </header>
      {loading && <SkeletonCards count={6} />}
      <ErrorMessage error={error} />
      {!loading && !error && categories.length === 0 && <EmptyState icon="layers" title="No services available yet." />}
      <div className="service-category-grid">
        {categories.map((category) => (
          <Link key={category.id} to={`/search?categoryId=${category.id}`} className="service-category card">
            <span className="category-tile__icon">
              <Icon name={categoryIcon(category.icon)} size={26} />
            </span>
            <div>
              <h2>{category.name}</h2>
              <p className="muted">{category.description}</p>
            </div>
            <Icon name="chevron-right" />
          </Link>
        ))}
      </div>
    </div>
  );
}
