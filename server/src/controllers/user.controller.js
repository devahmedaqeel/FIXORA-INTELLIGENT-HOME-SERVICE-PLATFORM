import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as userService from '../services/user.service.js';

export const getMe = asyncHandler(async (req, res) => sendSuccess(res, { data: await userService.getMe(req.user.uid) }));

export const updateMe = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await userService.updateMe(req.user.uid, req.body), message: 'Profile updated' }),
);

export const deleteMe = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await userService.deleteMe(req.user), message: 'Your account has been deleted' }),
);
