/** Small status pill. tone: success | warning | danger | info | neutral | accent */
export default function Badge({ tone = 'neutral', children, className = '' }) {
  return <span className={`badge badge--${tone} ${className}`}>{children}</span>;
}
