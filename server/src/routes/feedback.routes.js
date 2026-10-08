import { Router } from 'express';
import { authenticateUser, requireCustomer, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParams, paginationQuery } from '../validators/common.validator.js';
import { createReviewSchema, updateReviewSchema, createComplaintSchema } from '../validators/feedback.validator.js';
import { ROLES } from '../constants/index.js';
import * as controller from '../controllers/feedback.controller.js';

/* /api/reviews */
export const reviewRouter = Router();
reviewRouter.use(authenticateUser, requireCustomer);
reviewRouter.post('/', validate({ body: createReviewSchema }), controller.createReview);
reviewRouter.get('/my', controller.myReviews);
reviewRouter.put('/:id', validate({ params: idParams, body: updateReviewSchema }), controller.updateReview);

/* /api/complaints */
export const complaintRouter = Router();
complaintRouter.use(authenticateUser, requireRole(ROLES.CUSTOMER, ROLES.PROVIDER));
complaintRouter.post('/', validate({ body: createComplaintSchema }), controller.createComplaint);
complaintRouter.get('/my', validate({ query: paginationQuery }), controller.myComplaints);
complaintRouter.get('/:id', validate({ params: idParams }), controller.getComplaint);

/* /api/notifications */
export const notificationRouter = Router();
notificationRouter.use(authenticateUser);
notificationRouter.get('/', controller.listNotifications);
notificationRouter.patch('/read-all', controller.markAllNotificationsRead);
notificationRouter.patch('/:id/read', validate({ params: idParams }), controller.markNotificationRead);
