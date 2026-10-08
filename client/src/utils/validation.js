/*
 * Client-side validation for instant feedback. The server re-validates everything;
 * these rules mirror server/src/validators so messages are consistent.
 */

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const passwordProblem = (value) => {
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(value)) return 'Password must contain a letter';
  if (!/\d/.test(value)) return 'Password must contain a number';
  return '';
};

export const normalizePhone = (value = '') => value.replace(/[\s-]/g, '');
export const isUkPhone = (value) => /^(\+44|0)\d{9,10}$/.test(normalizePhone(value));
export const isPostcode = (value) => /^[A-Za-z]{1,2}\d[A-Za-z0-9]?\s?\d[A-Za-z]{2}$/.test(value.trim());

/**
 * Runs a map of field → [rule, message] pairs and returns { field: message } for failures.
 *   validateFields(values, { email: [(v) => isEmail(v), 'Enter a valid email'] })
 */
export function validateFields(values, rules) {
  return Object.entries(rules).reduce((errors, [field, [check, message]]) => {
    if (!check(values[field] ?? '', values)) errors[field] = message;
    return errors;
  }, {});
}

/** Maps server validation details ([{ field: "body.price", message }]) onto form fields. */
export const fieldErrorsFromApi = (error) =>
  (error?.details || []).reduce((acc, { field, message }) => {
    const key = field.split('.').slice(1).join('.') || field;
    acc[key] = message;
    return acc;
  }, {});
