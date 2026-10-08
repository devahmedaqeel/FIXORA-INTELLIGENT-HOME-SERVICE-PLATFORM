import { forwardRef, useId } from 'react';

/** Labelled <select>. options: [{ value, label }]. */
const Select = forwardRef(function Select({ label, error, hint, options = [], placeholder, id, className = '', required, ...rest }, ref) {
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className="field__control field__control--select"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
        required={required}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p id={`${selectId}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${selectId}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
