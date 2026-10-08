import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as authService from '../services/auth.service.js';

/** POST /api/auth/register — completes registration after Firebase Auth sign-up. */
export const register = asyncHandler(async (req, res) => {
  const session = await authService.registerProfile(req.firebaseUser, req.body);
  sendSuccess(res, { data: session, message: 'Account created successfully', statusCode: 201 });
});

/** POST /api/auth/verify — validates the token and returns the user's role & profile. */
export const verify = asyncHandler(async (req, res) => {
  const session = await authService.getSession(req.user.uid, { touchLogin: true });
  sendSuccess(res, { data: session, message: 'Session verified' });
});
