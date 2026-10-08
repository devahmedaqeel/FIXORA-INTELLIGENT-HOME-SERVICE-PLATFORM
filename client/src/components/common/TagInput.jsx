import { useId, useState } from 'react';
import Icon from './Icon';
import Button from './Button';

/**
 * Free-text tag input: type a value, press Enter or "Add" to turn it into a removable chip.
 * value: string[]
 */
export default function TagInput({ label, value = [], onChange, max = 15, maxLength = 40, placeholder = 'Type and press Enter', hint }) {
  const inputId = useId();
  const [draft, setDraft] = useState('');

  const commit = () => {
    const next = draft.trim();
    if (!next || value.length >= max || value.some((v) => v.toLowerCase() === next.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, next]);
    setDraft('');
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit();
    }
  };

  const remove = (tag) => onChange(value.filter((v) => v !== tag));

  return (
    <div className="field">
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
        </label>
      )}
      <div className="row">
        <input
          id={inputId}
          className="field__control"
          value={draft}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={value.length >= max}
        />
        <Button type="button" variant="secondary" size="sm" onClick={commit} disabled={!draft.trim() || value.length >= max}>
          Add
        </Button>
      </div>
      {hint && !value.length && <p className="field__hint">{hint}</p>}
      {value.length > 0 && (
        <ul className="chip-row" aria-label={label}>
          {value.map((tag) => (
            <li key={tag} className="chip chip--removable">
              {tag}
              <button type="button" onClick={() => remove(tag)} aria-label={`Remove ${tag}`}>
                <Icon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
