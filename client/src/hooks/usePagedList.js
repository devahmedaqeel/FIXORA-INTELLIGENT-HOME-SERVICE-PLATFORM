import { useState } from 'react';
import { useAsync } from './useAsync';

/**
 * Paginated + filtered list for admin tables.
 *   const list = usePagedList(listUsers, { role: '' });
 *   list.setFilter('role', 'provider'); list.setPage(2); list.reload();
 */
export function usePagedList(fetcher, initialFilters = {}, limit = 20) {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const key = JSON.stringify(filters);
  const result = useAsync(() => fetcher({ ...filters, page, limit }), [key, page]);

  return {
    ...result,
    items: result.data?.items || [],
    meta: result.data?.meta,
    filters,
    page,
    setPage,
    setFilter: (name, value) => {
      setFilters((f) => ({ ...f, [name]: value }));
      setPage(1);
    },
    /** Replace one row locally after an update. */
    replaceItem: (id, updated) =>
      result.setData((d) => (d ? { ...d, items: d.items.map((item) => (item.id === id || item.uid === id ? { ...item, ...updated } : item)) } : d)),
  };
}
