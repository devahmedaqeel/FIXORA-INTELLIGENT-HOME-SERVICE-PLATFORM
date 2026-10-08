import { forwardRef, useId } from 'react';

/**
 * Labelled input with hint and error text wired up for screen readers.
 * Pass `as="textarea"` for multi-line input.
 */
const Input = forwardRef(function Input({ label, error, hint, id, as = 'input', className = '', required, ...rest }, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  const describedBy = [error && `${inputId}-error`, hint && `${inputId}-hint`].filter(Boolean).join(' ') || undefined;
  const Field = as;

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      <Field
        ref={ref}
        id={inputId}
        className="field__control"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        required={required}
        {...rest}
      />
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
