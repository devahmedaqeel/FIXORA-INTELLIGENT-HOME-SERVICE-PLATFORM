import { Link } from 'react-router-dom';
import Icon from './Icon';

/**
 * <Button variant="primary|secondary|ghost|danger|link" size="sm|md|lg" loading icon="plus" to="/path">
 * Renders a <Link> when `to` is given, otherwise a <button>.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  block = false,
  to,
  className = '',
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', loading && 'is-loading', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? <span className="spinner spinner--sm" aria-hidden="true" /> : icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children && <span>{children}</span>}
      {iconRight && !loading && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
