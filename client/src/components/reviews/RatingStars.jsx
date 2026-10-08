import { useState } from 'react';
import Icon from '../common/Icon';

/**
 * Read-only stars (default) or an accessible 1–5 radio group when `onChange` is passed.
 */
export default function RatingStars({ value = 0, onChange, size = 16, showValue = false, label = 'Rating' }) {
  const [hover, setHover] = useState(0);

  if (!onChange) {
    const rounded = Math.round(value * 2) / 2;
    return (
      <span className="stars" aria-label={`${label}: ${Number(value).toFixed(1)} out of 5`} role="img">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`stars__star ${rounded >= n ? 'is-full' : rounded >= n - 0.5 ? 'is-half' : ''}`}>
            <Icon name="star" size={size} strokeWidth={1.5} />
          </span>
        ))}
        {showValue && <span className="stars__value">{Number(value).toFixed(1)}</span>}
      </span>
    );
  }

  const shown = hover || value;
  return (
    <div className="stars stars--input" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className={`stars__star ${shown >= n ? 'is-full' : ''}`} onMouseEnter={() => setHover(n)}>
          <input type="radio" name="rating" value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" />
          <Icon name="star" size={size} strokeWidth={1.5} />
          <span className="sr-only">{n} star{n > 1 ? 's' : ''}</span>
        </label>
      ))}
    </div>
  );
}
