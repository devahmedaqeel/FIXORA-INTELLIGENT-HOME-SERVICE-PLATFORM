import { forwardRef, useId, useState } from 'react';
import Icon from './Icon';

/**
 * Labelled input with hint and error text wired up for screen readers.
 * Pass `as="textarea"` for multi-line input. A `type="password"` field automatically gets
 * a show/hide toggle — no extra prop needed at call sites.
 */
const Input = forwardRef(function Input({ label, error, hint, id, as = 'input', className = '', required, type, ...rest }, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  const describedBy = [error && `${inputId}-error`, hint && `${inputId}-hint`].filter(Boolean).join(' ') || undefined;
  const Field = as;
  const isPassword = type === 'password';
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={isPassword ? 'field__input-wrap' : undefined}>
        <Field
          ref={ref}
          id={inputId}
          type={isPassword ? (revealed ? 'text' : 'password') : type}
          className="field__control"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          required={required}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle-visibility"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} size={18} />
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
