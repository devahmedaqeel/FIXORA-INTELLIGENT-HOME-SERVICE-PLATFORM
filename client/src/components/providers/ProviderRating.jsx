import RatingStars from '../reviews/RatingStars';

/** "★★★★☆ 4.5 (12 reviews)" or "New on Fixora" when unrated. */
export default function ProviderRating({ average = 0, count = 0, size = 14 }) {
  if (!count) return <span className="provider-rating provider-rating--new">New on Fixora</span>;
  return (
    <span className="provider-rating">
      <RatingStars value={average} size={size} />
      <strong>{Number(average).toFixed(1)}</strong>
      <span className="muted">
        ({count} review{count === 1 ? '' : 's'})
      </span>
    </span>
  );
}
