/** Wraps an async route handler so rejected promises reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Uniform success envelope: { success, message, data, meta? } */
export function sendSuccess(res, { data = null, message = 'OK', statusCode = 200, meta } = {}) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

/** In-memory pagination for already-filtered lists. */
export function paginate(items, { page = 1, limit = 20 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const start = (safePage - 1) * safeLimit;
  return {
    items: items.slice(start, start + safeLimit),
    meta: {
      page: safePage,
      limit: safeLimit,
      total: items.length,
      totalPages: Math.max(Math.ceil(items.length / safeLimit), 1),
    },
  };
}

/** Returns a copy containing only the listed keys that are defined. */
export function pick(source, keys) {
  return keys.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});
}
