import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar';
import SearchFilters from './SearchFilters';
import ProviderCard from '../providers/ProviderCard';
import { SkeletonCards } from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import Button from '../common/Button';
import { useAsync } from '../../hooks/useAsync';
import { useCategories } from '../../hooks/useCategories';
import { searchProviders } from '../../features/providers/provider.service';

const SEARCH_KEYS = ['categoryId', 'areaId', 'postalCode'];
const FILTER_KEYS = ['minRating', 'maxPrice', 'availableOn', 'sort', 'page'];

/**
 * Search page body shared by the public /search and customer /customer/search routes.
 * All state is kept in the URL query string.
 */
export default function SearchResultsView({ action, profilePathFor, bookPathFor, savedIds, onSaveToggle }) {
  const [params, setParams] = useSearchParams();
  const { categories } = useCategories();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = Object.fromEntries([...SEARCH_KEYS, ...FILTER_KEYS].map((k) => [k, params.get(k) || undefined]));
  const key = params.toString();

  const { data, loading, error, reload } = useAsync(() => searchProviders({ ...query, limit: 12 }), [key]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query.page]);

  const updateParams = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const category = categories.find((c) => c.id === query.categoryId);
  const area = data?.context?.area;
  const zipAreas = data?.context?.areasForPostalCode;
  const where = area ? `${area.areaName}, ${area.city}` : query.postalCode ? `postcode ${query.postalCode}` : 'all areas';

  return (
    <div className="search-page">
      <section className="search-page__bar">
        <SearchBar key={key} action={action} initial={query} variant="compact" />
      </section>

      <div className="search-page__head">
        <div>
          <h1 className="search-page__title">
            {category ? category.name : 'All services'} <span className="muted">in {where}</span>
          </h1>
          {zipAreas?.length > 0 && <p className="muted small">Postal code {query.postalCode} covers: {zipAreas.map((a) => a.areaName).join(', ')}</p>}
          {data && <p className="muted small">{data.meta.total} verified provider{data.meta.total === 1 ? '' : 's'} found</p>}
        </div>
        <Button variant="secondary" size="sm" icon="filter" className="search-page__filter-toggle" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>
          Filters
        </Button>
      </div>

      <div className="search-page__layout">
        <div className={`search-page__filters ${filtersOpen ? 'is-open' : ''}`}>
          <SearchFilters values={query} onChange={updateParams} onReset={() => updateParams({ minRating: '', maxPrice: '', availableOn: '', sort: '' })} />
        </div>

        <div className="search-page__results">
          {loading && <SkeletonCards count={4} />}
          {error && <ErrorMessage error={error} onRetry={reload} />}
          {!loading && !error && data?.items.length === 0 && (
            <EmptyState
              icon="search"
              title="No providers found in this area."
              message="Try a nearby area, a different postcode, or remove some filters."
            />
          )}
          {!loading && !error && data?.items.length > 0 && (
            <>
              <div className="card-grid card-grid--results">
                {data.items.map((result) => (
                  <ProviderCard
                    key={result.provider.id}
                    result={result}
                    profilePath={profilePathFor(result.provider.id)}
                    bookPath={bookPathFor?.(result.provider.id, result.primaryService?.id)}
                    saved={savedIds?.includes(result.provider.id)}
                    onSaveToggle={onSaveToggle}
                  />
                ))}
              </div>
              <Pagination meta={data.meta} onChange={(page) => updateParams({ page: String(page) })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
