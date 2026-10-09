import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as authService from '../services/auth.service.js';
import * as adminInviteService from '../services/adminInvite.service.js';

/** POST /api/auth/register — completes registration after Firebase Auth sign-up. */
export const register = asyncHandler(async (req, res) => {
  const session = await authService.registerProfile(req.firebaseUser, req.body);
  sendSuccess(res, { data: session, message: 'Account created successfully', statusCode: 201 });
});

/**
 * POST /api/auth/admin-signup — grants the admin role ONLY when the request carries a valid,
 * unused, unexpired invite token issued by an existing admin for this exact email. This is
 * the only path by which a Firebase Auth account can become role: admin outside the trusted
 * `npm run create-admin` CLI script.
 */
export const adminSignup = asyncHandler(async (req, res) => {
  const session = await adminInviteService.redeemInvite(req.firebaseUser, req.body.token);
  sendSuccess(res, { data: session, message: 'Admin account created successfully', statusCode: 201 });
});

/** POST /api/auth/verify — validates the token and returns the user's role & profile. */
export const verify = asyncHandler(async (req, res) => {
  const session = await authService.getSession(req.user.uid, { touchLogin: true });
  sendSuccess(res, { data: session, message: 'Session verified' });
});
