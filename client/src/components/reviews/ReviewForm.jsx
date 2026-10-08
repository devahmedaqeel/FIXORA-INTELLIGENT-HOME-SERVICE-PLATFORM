import { useState } from 'react';
import RatingStars from './RatingStars';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { createReview, updateReview } from '../../features/reviews/review.service';

const RATING_WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

/** Create (bookingId) or edit (review) a review. */
export default function ReviewForm({ bookingId, review, onSaved, onCancel }) {
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (!rating) {
      setError('Please choose a rating from 1 to 5 stars.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = review ? await updateReview(review.id, { rating, comment }) : await createReview({ bookingId, rating, comment });
      onSaved?.(saved);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <div className="field">
        <span className="field__label" id="rating-label">
          Your rating
        </span>
        <div className="row row--center">
          <RatingStars value={rating} onChange={setRating} size={30} label="Your rating" />
          <span className="muted">{RATING_WORDS[rating]}</span>
        </div>
      </div>
      <Input
        as="textarea"
        rows={4}
        label="Comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        hint="What went well? What could be better?"
      />
      <ErrorMessage error={error} compact />
      <div className="row row--end">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={saving}>
          {review ? 'Update review' : 'Submit review'}
        </Button>
      </div>
    </form>
  );
}
