import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as adminService from '../services/admin.service.js';
import * as bookingService from '../services/booking.service.js';
import * as reviewService from '../services/review.service.js';
import * as complaintService from '../services/complaint.service.js';
import * as settingsService from '../services/settings.service.js';
import * as auditLogService from '../services/auditLog.service.js';
import * as adminInviteService from '../services/adminInvite.service.js';
import { AUDIT_ACTIONS } from '../constants/index.js';

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

/* Payment settings (commission rate, deadline, business bank account) */
const pickPaymentSettings = (s) => ({
  commissionRatePercent: s.commissionRatePercent,
  commissionPaymentDeadlineDays: s.commissionPaymentDeadlineDays,
  businessPaymentAccount: s.businessPaymentAccount,
  enabledCommissionPaymentMethods: s.enabledCommissionPaymentMethods,
});

export const getPaymentSettings = asyncHandler(async (_req, res) =>
  sendSuccess(res, { data: pickPaymentSettings(await settingsService.getSettings()) }),
);
/* Admin team (invite-based admin onboarding) */
export const listAdmins = asyncHandler(async (_req, res) => sendSuccess(res, { data: await adminService.listAdminAccounts() }));
export const createInvite = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await adminInviteService.createInvite(req.user, req.body.email), message: 'Invite created', statusCode: 201 }),
);
export const listInvites = asyncHandler(async (_req, res) => sendSuccess(res, { data: await adminInviteService.listPendingInvites() }));

export const updatePaymentSettings = asyncHandler(async (req, res) => {
  const saved = await settingsService.updateSettings(req.body, req.user.uid);
  await auditLogService.record({
    action: AUDIT_ACTIONS.PAYMENT_SETTINGS_UPDATED,
    actorId: req.user.uid,
    actorRole: req.user.role,
    actorName: req.user.displayName,
    details: `Payment settings updated: ${Object.keys(req.body).join(', ')}`,
  });
  sendSuccess(res, { data: pickPaymentSettings(saved), message: 'Payment settings saved' });
});
