import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';
import { SEARCH_SORTS } from '../../constants';
import { todayUk } from '../../utils/date';

/** Rating / price / availability / sort filters. Values live in the URL. */
export default function SearchFilters({ values, onChange, onReset }) {
  const set = (key) => (event) => onChange({ [key]: event.target.value });
  return (
    <div className="filters card">
      <h2 className="card__title">Filters</h2>
      <Select
        label="Minimum rating"
        value={values.minRating || ''}
        onChange={set('minRating')}
        placeholder="Any rating"
        options={[
          { value: '4.5', label: '4.5 ★ and up' },
          { value: '4', label: '4 ★ and up' },
          { value: '3', label: '3 ★ and up' },
        ]}
      />
      <Input label="Max starting price (£)" type="number" min="0" step="10" inputMode="decimal" value={values.maxPrice || ''} onChange={set('maxPrice')} placeholder="Any price" />
      <Input label="Available on" type="date" min={todayUk()} value={values.availableOn || ''} onChange={set('availableOn')} />
      <Select label="Sort by" value={values.sort || 'rating'} onChange={set('sort')} options={SEARCH_SORTS} />
      <Button variant="ghost" size="sm" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}
