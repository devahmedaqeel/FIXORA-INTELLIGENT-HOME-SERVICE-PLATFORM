import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as adminService from '../services/admin.service.js';
import * as bookingService from '../services/booking.service.js';
import * as reviewService from '../services/review.service.js';
import * as complaintService from '../services/complaint.service.js';
import * as settingsService from '../services/settings.service.js';

const paged = (res, { items, meta }) => sendSuccess(res, { data: items, meta });

export const dashboard = asyncHandler(async (_req, res) => sendSuccess(res, { data: await adminService.getDashboardStats() }));

/* Users */
export const listUsers = asyncHandler(async (req, res) => paged(res, await adminService.listUsers(req.query)));
export const getUser = asyncHandler(async (req, res) => sendSuccess(res, { data: await adminService.getUserDetail(req.params.id) }));
export const updateUserStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await adminService.updateUserStatus(req.user, req.params.id, req.body), message: 'User status updated' }),
);

/* Providers */
export const listProviders = asyncHandler(async (req, res) => paged(res, await adminService.listProviders(req.query)));
export const getProvider = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await adminService.getProviderDetail(req.params.id) }),
);
export const setVerification = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    data: await adminService.setProviderVerification(req.user, req.params.id, req.body),
    message: `Provider marked as ${req.body.status}`,
  }),
);

/* Bookings */
export const listBookings = asyncHandler(async (req, res) => paged(res, await bookingService.listAllBookings(req.query)));
export const updateBookingStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await bookingService.updateBookingStatus(req.user, req.params.id, req.body), message: 'Booking updated' }),
);

/* Reviews */
export const listReviews = asyncHandler(async (req, res) => paged(res, await reviewService.listAllReviews(req.query)));
export const moderateReview = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await reviewService.moderateReview(req.user, req.params.id, req.body), message: 'Review updated' }),
);

/* Complaints */
export const listComplaints = asyncHandler(async (req, res) => paged(res, await complaintService.listAllComplaints(req.query)));
export const updateComplaint = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await complaintService.updateComplaint(req.user, req.params.id, req.body), message: 'Complaint updated' }),
);

/* Chatbot queries */
export const listChatbotQueries = asyncHandler(async (req, res) => paged(res, await adminService.listChatbotQueries(req.query)));
export const resolveChatbotQuery = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await adminService.resolveChatbotQuery(req.user, req.params.id, req.body), message: 'Query updated' }),
);

/* Settings */
export const getSettings = asyncHandler(async (_req, res) => sendSuccess(res, { data: await settingsService.getSettings() }));
export const updateSettings = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await settingsService.updateSettings(req.body, req.user.uid), message: 'Settings saved' }),
);
