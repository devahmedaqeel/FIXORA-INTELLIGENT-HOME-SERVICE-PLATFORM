import { useEffect, useId, useState } from 'react';
import Icon from '../common/Icon';
import { useDebounce } from '../../hooks/useDebounce';
import { searchAreas } from '../../services/catalog.service';

export const areaLabel = (area) => `${area.areaName}, ${area.city}`;

/**
 * Accessible area autocomplete backed by the `areas` collection (no maps API).
 * value: { id, label } | null · onChange(area | null)
 */
export default function AreaPicker({ value, onChange, label = 'Area', placeholder = 'e.g. New Mirpur City', id, excludeIds = [], hint }) {
  const autoId = useId();
  const inputId = id || autoId;
  const listId = `${inputId}-list`;
  const [query, setQuery] = useState(value?.label || '');
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 250);

  useEffect(() => {
    setQuery(value?.label || '');
  }, [value?.id, value?.label]);

  useEffect(() => {
    if (!open || debounced.trim().length < 2 || debounced === value?.label) {
      setOptions([]);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    searchAreas({ q: debounced.trim(), limit: 8 })
      .then(({ items }) => !cancelled && setOptions(items.filter((a) => !excludeIds.includes(a.id))))
      .catch(() => !cancelled && setOptions([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, open]);

  const choose = (area) => {
    onChange({ ...area, label: areaLabel(area) });
    setQuery(areaLabel(area));
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event) => {
    if (!options.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      choose(options[active]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && (options.length > 0 || loading || debounced.trim().length >= 2);

  return (
    <div className="field combobox">
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
        </label>
      )}
      <div className="combobox__control">
        <Icon name="map-pin" size={18} />
        <input
          id={inputId}
          className="field__control"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
        />
        {value && (
          <button
            type="button"
            className="icon-btn icon-btn--sm"
            aria-label="Clear area"
            onClick={() => {
              onChange(null);
              setQuery('');
            }}
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
      {hint && <p className="field__hint">{hint}</p>}
      {showList && (
        <ul id={listId} className="combobox__list" role="listbox">
          {loading && <li className="combobox__empty">Searching…</li>}
          {!loading && options.length === 0 && <li className="combobox__empty">No matching areas. Try a city or postal code.</li>}
          {options.map((area, index) => (
            <li
              key={area.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={`combobox__option ${index === active ? 'is-active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(area);
              }}
            >
              <span>{areaLabel(area)}</span>
              <span className="muted small">
                {area.province} · {area.postalCode}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
