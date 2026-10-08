import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as reviewService from '../services/review.service.js';
import * as complaintService from '../services/complaint.service.js';
import * as notificationService from '../services/notification/notification.service.js';

/* ---------- Reviews ---------- */

export const createReview = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await reviewService.createReview(req.user, req.body), message: 'Thank you for your review!', statusCode: 201 }),
);

export const updateReview = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await reviewService.updateOwnReview(req.user, req.params.id, req.body), message: 'Review updated' }),
);

export const myReviews = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await reviewService.listMyReviews(req.user) }),
);

/* ---------- Complaints ---------- */

export const createComplaint = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    data: await complaintService.createComplaint(req.user, req.body),
    message: 'Your complaint has been submitted. Our team will respond soon.',
    statusCode: 201,
  }),
);

export const myComplaints = asyncHandler(async (req, res) => {
  const { items, meta } = await complaintService.listMyComplaints(req.user, req.query);
  sendSuccess(res, { data: items, meta });
});

export const getComplaint = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await complaintService.getComplaint(req.user, req.params.id) }),
);

/* ---------- Notifications ---------- */

export const listNotifications = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await notificationService.listForUser(req.user.uid) }),
);

export const markNotificationRead = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await notificationService.markRead(req.user.uid, req.params.id) }),
);

export const markAllNotificationsRead = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await notificationService.markAllRead(req.user.uid), message: 'All notifications marked as read' }),
);
