import Icon from './Icon';
import Button from './Button';

/** Error state with an optional retry action. Accepts an Error or a string. */
export default function ErrorMessage({ error, title = 'Something went wrong', onRetry, compact = false }) {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error.message;
  return (
    <div className={`state state--error ${compact ? 'state--compact' : ''}`} role="alert">
      <Icon name="alert" size={compact ? 18 : 28} />
      <div>
        {!compact && <p className="state__title">{title}</p>}
        <p className="state__text">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon="refresh" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
