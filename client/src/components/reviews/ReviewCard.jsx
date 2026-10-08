import RatingStars from './RatingStars';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { timeAgo } from '../../utils/format';

export default function ReviewCard({ review, showStatus = false, actions }) {
  return (
    <article className="review-card">
      <header className="review-card__header">
        <Avatar name={review.customerName} size={36} />
        <div className="review-card__meta">
          <p className="review-card__author">{review.customerName}</p>
          <p className="muted small">
            {review.serviceTitle && <>{review.serviceTitle} · </>}
            {timeAgo(review.createdAt)}
          </p>
        </div>
        <RatingStars value={review.rating} />
      </header>
      {review.comment ? <p className="review-card__comment">{review.comment}</p> : <p className="muted small">No written comment.</p>}
      {(showStatus || actions) && (
        <footer className="review-card__footer">
          {showStatus && <Badge tone={review.status === 'removed' ? 'danger' : 'success'}>{review.status}</Badge>}
          {actions}
        </footer>
      )}
    </article>
  );
}
