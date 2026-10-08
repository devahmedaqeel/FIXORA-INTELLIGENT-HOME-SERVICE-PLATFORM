import { ApiError } from '../utils/ApiError.js';

/**
 * Validates req.body / req.query / req.params against zod schemas and replaces them
 * with the parsed (coerced, stripped) values.
 *   router.post('/', validate({ body: createBookingSchema }), controller.create)
 */
export const validate = (schemas) => (req, _res, next) => {
  const details = [];
  for (const part of ['params', 'query', 'body']) {
    const schema = schemas[part];
    if (!schema) continue;
    const result = schema.safeParse(req[part] ?? {});
    if (result.success) {
      if (part === 'query') {
        // req.query is a getter in Express 5-style setups; assign defensively.
        Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true });
      } else {
        req[part] = result.data;
      }
    } else {
      for (const issue of result.error.issues) {
        details.push({ field: [part, ...issue.path].join('.'), message: issue.message });
      }
    }
  }
  if (details.length) {
    return next(ApiError.badRequest(details[0].message, undefined, details));
  }
  return next();
};
