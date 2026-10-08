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

export const listAddresses = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await customerService.listAddresses(req.user.uid) }),
);

export const addAddress = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await customerService.addAddress(req.user.uid, req.body), message: 'Address added' }),
);

export const updateAddress = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await customerService.updateAddress(req.user.uid, req.params.addressId, req.body), message: 'Address updated' }),
);

export const deleteAddress = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await customerService.deleteAddress(req.user.uid, req.params.addressId), message: 'Address removed' }),
);
