import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as reportsService from './reports.service.js';

export const summary = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await reportsService.getSummaryReport(req.query), message: 'Report generated' }),
);

export const bookings = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await reportsService.getBookingReport(req.query) }),
);

export const providers = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await reportsService.getProviderReport(req.query) }),
);

export const categories = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await reportsService.getCategoryReport(req.query) }),
);

export const users = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await reportsService.getUserGrowthReport(req.query) }),
);
