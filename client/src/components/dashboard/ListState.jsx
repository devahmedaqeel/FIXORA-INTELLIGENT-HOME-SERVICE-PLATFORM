import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';

/** Loading / error / empty / list + pagination wrapper for admin lists. */
export default function ListState({ list, emptyTitle, emptyIcon = 'inbox', children }) {
  if (list.loading && !list.data) return <Loader />;
  if (list.error) return <ErrorMessage error={list.error} onRetry={list.reload} />;
  if (list.items.length === 0) return <EmptyState icon={emptyIcon} title={emptyTitle} />;
  return (
    <>
      {children}
      <Pagination meta={list.meta} onChange={list.setPage} />
    </>
  );
}
