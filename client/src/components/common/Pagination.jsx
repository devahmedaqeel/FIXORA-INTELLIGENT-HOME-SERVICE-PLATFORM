import Icon from './Icon';

/** Pagination driven by API meta: { page, totalPages, total }. */
export default function Pagination({ meta, onChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages, total } = meta;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <Icon name="chevron-left" size={16} />
        <span>Previous</span>
      </button>
      <span className="pagination__status">
        Page {page} of {totalPages} <span className="muted">· {total} results</span>
      </span>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        <span>Next</span>
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  );
}
