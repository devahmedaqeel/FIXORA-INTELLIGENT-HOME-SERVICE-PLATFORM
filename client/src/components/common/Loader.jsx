/** Loading indicator. `fullPage` centers it in the viewport; `inline` keeps it small. */
export default function Loader({ label = 'Loading…', fullPage = false, inline = false }) {
  return (
    <div className={`loader ${fullPage ? 'loader--page' : ''} ${inline ? 'loader--inline' : ''}`} role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span className={inline ? 'sr-only' : 'loader__label'}>{label}</span>
    </div>
  );
}

/** Placeholder blocks while card lists load. */
export function SkeletonCards({ count = 3 }) {
  return (
    <div className="card-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton--avatar" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      ))}
    </div>
  );
}
