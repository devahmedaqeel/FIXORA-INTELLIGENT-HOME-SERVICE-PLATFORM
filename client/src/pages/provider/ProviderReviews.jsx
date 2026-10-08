import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ReviewCard from '../../components/reviews/ReviewCard';
import RatingStars from '../../components/reviews/RatingStars';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../features/auth/auth.context';
import { getProviderReviews } from '../../features/providers/provider.service';

export default function ProviderReviews() {
  useDocumentTitle('Reviews');
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(() => getProviderReviews(user.uid, { page, limit: 10 }), [page]);

  const summary = data?.items?.summary;
  const reviews = data?.items?.items || [];

  return (
    <div className="stack stack--lg">
      <PageHeader title="Customer reviews" description="Reviews customers left after completed bookings." />
      {loading && <Loader />}
      <ErrorMessage error={error} onRetry={reload} />
      {summary && (
        <section className="card rating-summary">
          <div className="rating-summary__score">
            <p className="rating-summary__value">{summary.ratingCount ? summary.ratingAverage.toFixed(1) : '—'}</p>
            <RatingStars value={summary.ratingAverage} size={18} />
            <p className="muted small">{summary.ratingCount} reviews</p>
          </div>
          <ul className="rating-summary__bars">
            {summary.distribution.map((d) => (
              <li key={d.stars}>
                <span>{d.stars}★</span>
                <span className="bar-list__track">
                  <span className="bar-list__fill" style={{ width: `${summary.ratingCount ? (d.count / summary.ratingCount) * 100 : 0}%` }} />
                </span>
                <span className="muted small">{d.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {data && reviews.length === 0 && <EmptyState icon="star" title="No reviews yet." message="Complete bookings to start collecting reviews." />}
      <div className="stack">
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
      <Pagination meta={data?.meta} onChange={setPage} />
    </div>
  );
}
