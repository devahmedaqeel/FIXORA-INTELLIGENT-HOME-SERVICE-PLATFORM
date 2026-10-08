import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaPicker from './AreaPicker';
import Select from '../common/Select';
import Button from '../common/Button';
import { useCategories } from '../../hooks/useCategories';
import { getArea } from '../../services/catalog.service';
import { isPostcode } from '../../utils/validation';

/**
 * Category + Area + Postcode search. Submits to `action` (e.g. /search or /customer/search)
 * as query-string params so results are shareable and survive refresh.
 */
export default function SearchBar({ action = '/search', initial = {}, variant = 'hero' }) {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [categoryId, setCategoryId] = useState(initial.categoryId || '');
  const [area, setArea] = useState(null);
  const [postalCode, setPostalCode] = useState(initial.postalCode || '');
  const [error, setError] = useState('');

  // Restore the selected area label when arriving with ?areaId=
  useEffect(() => {
    if (!initial.areaId) return;
    getArea(initial.areaId)
      .then((a) => setArea({ ...a, label: `${a.areaName}, ${a.city}` }))
      .catch(() => {});
  }, [initial.areaId]);

  const submit = (event) => {
    event.preventDefault();
    const code = postalCode.trim();
    if (code && !isPostcode(code)) {
      setError('Enter a valid UK postcode, e.g. SW1A 1AA');
      return;
    }
    if (!area && !code && !categoryId) {
      setError('Choose a service, an area or a postcode');
      return;
    }
    setError('');
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    if (area) params.set('areaId', area.id);
    else if (code) params.set('postalCode', code);
    navigate(`${action}?${params.toString()}`);
  };

  return (
    <form className={`search-bar search-bar--${variant}`} onSubmit={submit} role="search" aria-label="Find a service provider">
      <Select
        label="Service"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        placeholder="All services"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
      <AreaPicker value={area} onChange={setArea} label="Area" />
      <div className="field search-bar__zip">
        <label htmlFor={`zip-${variant}`} className="field__label">
          Postcode
        </label>
        <input
          id={`zip-${variant}`}
          className="field__control"
          maxLength={8}
          placeholder="SW1A 1AA"
          value={postalCode}
          disabled={Boolean(area)}
          onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
          aria-describedby={error ? `search-error-${variant}` : undefined}
        />
      </div>
      <Button type="submit" icon="search" size="lg" className="search-bar__submit">
        Search
      </Button>
      {error && (
        <p id={`search-error-${variant}`} className="field__error search-bar__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
