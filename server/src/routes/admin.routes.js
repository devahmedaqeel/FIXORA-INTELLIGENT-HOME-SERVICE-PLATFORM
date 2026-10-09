import { Router } from 'express';
import { authenticateUser, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParams } from '../validators/common.validator.js';
import {
  listUsersQuery,
  updateUserStatusSchema,
  listProvidersQuery,
  verifyProviderSchema,
  updateSettingsSchema,
  chatbotQueriesQuery,
  resolveChatbotQuerySchema,
  createInviteSchema,
} from '../validators/admin.validator.js';
import { adminListBookingsQuery, updateBookingStatusSchema } from '../validators/booking.validator.js';
import { moderateReviewSchema, updateComplaintSchema, listComplaintsQuery } from '../validators/feedback.validator.js';
import { createAreaSchema, updateAreaSchema, searchAreasQuery } from '../validators/catalog.validator.js';
import { z } from 'zod';
import { REVIEW_STATUS } from '../constants/index.js';
import { paginationQuery } from '../validators/common.validator.js';
import {
  listPaymentsQuery,
  resolveDisputeSchema,
  listCommissionsQuery,
  verifyCommissionSchema,
  rejectCommissionSchema,
  partialPaymentSchema,
  waiveCommissionSchema,
  listAuditLogsQuery,
  paymentSettingsSchema,
} from '../validators/finance.validator.js';
import * as controller from '../controllers/admin.controller.js';
import * as catalogController from '../controllers/catalog.controller.js';
import * as paymentController from '../controllers/payment.controller.js';
import * as commissionController from '../controllers/commission.controller.js';
import * as auditLogController from '../controllers/auditLog.controller.js';
import reportsRouter from '../reports/reports.routes.js';

const router = Router();

// BR-8 and every other admin capability: authenticated AND role === admin (from Firestore).
router.use(authenticateUser, requireAdmin);

router.get('/dashboard', controller.dashboard);

router.get('/users', validate({ query: listUsersQuery }), controller.listUsers);
router.get('/users/:id', validate({ params: idParams }), controller.getUser);
router.patch('/users/:id/status', validate({ params: idParams, body: updateUserStatusSchema }), controller.updateUserStatus);

router.get('/providers', validate({ query: listProvidersQuery }), controller.listProviders);
router.get('/providers/:id', validate({ params: idParams }), controller.getProvider);
router.patch('/providers/:id/verification', validate({ params: idParams, body: verifyProviderSchema }), controller.setVerification);

router.get('/areas', validate({ query: searchAreasQuery }), (req, _res, next) => {
  req.query.includeInactive = true;
  next();
}, catalogController.searchAreas);
router.post('/areas', validate({ body: createAreaSchema }), catalogController.createArea);
router.put('/areas/:id', validate({ params: idParams, body: updateAreaSchema }), catalogController.updateArea);
router.delete('/areas/:id', validate({ params: idParams }), catalogController.deleteArea);

router.get('/bookings', validate({ query: adminListBookingsQuery }), controller.listBookings);
router.patch('/bookings/:id/status', validate({ params: idParams, body: updateBookingStatusSchema }), controller.updateBookingStatus);

router.get(
  '/reviews',
  validate({ query: paginationQuery.extend({ status: z.enum(Object.values(REVIEW_STATUS)).optional() }) }),
  controller.listReviews,
);
router.patch('/reviews/:id', validate({ params: idParams, body: moderateReviewSchema }), controller.moderateReview);

router.get('/complaints', validate({ query: listComplaintsQuery }), controller.listComplaints);
router.patch('/complaints/:id', validate({ params: idParams, body: updateComplaintSchema }), controller.updateComplaint);

router.get('/chatbot-queries', validate({ query: chatbotQueriesQuery }), controller.listChatbotQueries);
router.patch('/chatbot-queries/:id', validate({ params: idParams, body: resolveChatbotQuerySchema }), controller.resolveChatbotQuery);

router.get('/admins', controller.listAdmins);
router.post('/invites', validate({ body: createInviteSchema }), controller.createInvite);
router.get('/invites', controller.listInvites);

router.get('/settings', controller.getSettings);
router.put('/settings', validate({ body: updateSettingsSchema }), controller.updateSettings);
router.get('/payment-settings', controller.getPaymentSettings);
router.put('/payment-settings', validate({ body: paymentSettingsSchema }), controller.updatePaymentSettings);

router.get('/payments', validate({ query: listPaymentsQuery }), paymentController.listAll);
router.post('/payments/:id/resolve-dispute', validate({ params: idParams, body: resolveDisputeSchema }), paymentController.resolveDispute);

router.get('/commissions', validate({ query: listCommissionsQuery }), commissionController.listAll);
router.get('/commissions/:id', validate({ params: idParams }), commissionController.getDetail);
router.post('/commissions/:id/verify', validate({ params: idParams, body: verifyCommissionSchema }), commissionController.verify);
router.post('/commissions/:id/reject', validate({ params: idParams, body: rejectCommissionSchema }), commissionController.reject);
router.post('/commissions/:id/partial-payment', validate({ params: idParams, body: partialPaymentSchema }), commissionController.recordPartialPayment);
router.post('/commissions/:id/waive', validate({ params: idParams, body: waiveCommissionSchema }), commissionController.waive);

router.get('/financial-reports', commissionController.financialOverview);
router.get('/audit-logs', validate({ query: listAuditLogsQuery }), auditLogController.listAll);

router.use('/reports', reportsRouter);

export default router;
