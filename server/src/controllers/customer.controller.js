import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as customerService from '../services/customer.service.js';

export const dashboard = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await customerService.getDashboard(req.user.uid) }),
);

export const listSaved = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await customerService.listSavedProviders(req.user.uid) }),
);

export const savedIds = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await customerService.getSavedProviderIds(req.user.uid) }),
);

export const save = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await customerService.saveProvider(req.user.uid, req.params.id), message: 'Provider saved' }),
);

export const unsave = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await customerService.unsaveProvider(req.user.uid, req.params.id), message: 'Provider removed from saved list' }),
);
