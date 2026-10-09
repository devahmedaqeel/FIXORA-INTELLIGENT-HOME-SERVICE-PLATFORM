import { auth } from '../firebase';
import { handleMockRequest } from './mockData';

/*
 * Single HTTP client for the Fixora REST API.
 * - Attaches "Authorization: Bearer <Firebase ID token>" when a user is signed in.
 * - Unwraps the { success, message, data, meta } envelope.
 * - Throws ApiError with the server's message/errorCode so UI can react to e.g. BOOKING_CONFLICT.
 * - Falls back to mock data when the backend is unreachable (demo/offline mode).
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, errorCode = 'NETWORK_ERROR', details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }
}

const toQueryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

async function request(method, path, { body, params, auth: withAuth = true, raw = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (withAuth && auth?.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}${toQueryString(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Server unreachable — try mock data before throwing
    const mock = handleMockRequest(method, path, { body, params });
    if (mock.matched) {
      return raw || mock.raw ? mock.data : mock.data;
    }
    throw new ApiError('Cannot reach the Fixora server. Check your connection and try again.');
  }

  let payload = null;
  let unparseableBody = false;
  try {
    payload = await response.json();
  } catch {
    payload = null;
    unparseableBody = true;
  }

  if (!response.ok || payload?.success === false) {
    // On server error, try mock data as fallback for GET requests
    if (method === 'GET') {
      const mock = handleMockRequest(method, path, { body, params });
      if (mock.matched) {
        return raw || mock.raw ? mock.data : mock.data;
      }
    }
    // The real API always responds with JSON (see server error.middleware.js). A response
    // body that fails to parse means the request never reached it — e.g. the backend isn't
    // running and the Vite dev proxy returned its own plain-text error — not an application
    // error, so say that plainly instead of a bare, unexplained "Request failed (500)".
    const message = payload?.message || (unparseableBody ? 'Cannot reach the Fixora server. Check your connection and try again.' : `Request failed (${response.status})`);
    throw new ApiError(message, {
      status: response.status,
      errorCode: payload?.errorCode || 'REQUEST_FAILED',
      details: payload?.details,
    });
  }
  return raw ? payload : payload?.data;
}

export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  delete: (path, body, options) => request('DELETE', path, { ...options, body }),
  /** Returns the full envelope (data + meta) — used for paginated lists. */
  getPage: (path, params) => request('GET', path, { params, raw: true }).then((p) => ({ items: p.data ?? p, meta: p.meta, message: p.message })),
};

