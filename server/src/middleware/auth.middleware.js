import { getAuth } from '../config/firebase.js';
import { env } from '../config/environment.js';
import { userRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ACCOUNT_STATUS, ERROR_CODES, ROLES } from '../constants/index.js';

const extractBearerToken = (req) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token.trim() : null;
};

async function decodeToken(token) {
  try {
    // checkRevoked in production so disabled/deleted accounts lose access immediately.
    return await getAuth().verifyIdToken(token, env.isProduction);
  } catch {
    throw ApiError.unauthorized('Your session is invalid or has expired. Please sign in again.', ERROR_CODES.INVALID_TOKEN);
  }
}

const toRequestUser = (decoded, profile) => ({
  uid: decoded.uid,
  email: profile?.email ?? decoded.email ?? null,
  emailVerified: Boolean(decoded.email_verified),
  role: profile?.role ?? null,
  status: profile?.status ?? null,
  displayName: profile?.displayName ?? decoded.name ?? '',
});

/**
 * Verifies the Firebase ID token only (no Firestore profile required).
 * Used by registration, where the profile does not exist yet.
 */
export async function verifyFirebaseToken(req, _res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) throw ApiError.unauthorized();
    req.firebaseUser = await decodeToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Verifies the token AND loads the Firestore user record. The role always comes from
 * Firestore — never from the request body, query string or client-side claims.
 */
export async function authenticateUser(req, _res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) throw ApiError.unauthorized();
    const decoded = await decodeToken(token);
    const profile = await userRepository.findById(decoded.uid);
    if (!profile) {
      throw ApiError.forbidden('Your account profile is incomplete. Please finish registration.', ERROR_CODES.PROFILE_NOT_FOUND);
    }
    if (profile.status === ACCOUNT_STATUS.SUSPENDED || profile.status === ACCOUNT_STATUS.DELETED) {
      throw ApiError.forbidden('This account has been suspended. Contact support for help.', ERROR_CODES.ACCOUNT_SUSPENDED);
    }
    req.user = toRequestUser(decoded, profile);
    next();
  } catch (error) {
    next(error);
  }
}

/** Attaches req.user when a valid token is present; continues anonymously otherwise. */
export async function optionalAuth(req, _res, next) {
  const token = extractBearerToken(req);
  if (!token) return next();
  try {
    const decoded = await getAuth().verifyIdToken(token);
    const profile = await userRepository.findById(decoded.uid);
    if (profile && profile.status === ACCOUNT_STATUS.ACTIVE) req.user = toRequestUser(decoded, profile);
  } catch {
    // An invalid token on a public endpoint is treated as anonymous.
  }
  return next();
}

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    return next();
  };

export const requireCustomer = requireRole(ROLES.CUSTOMER);
export const requireProvider = requireRole(ROLES.PROVIDER);
export const requireAdmin = requireRole(ROLES.ADMIN);
