import { Router } from 'express';
import { authenticateUser, requireCustomer, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { bookingLimiter } from '../middleware/rateLimit.middleware.js';
import { idParams } from '../validators/common.validator.js';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
  listBookingsQuery,
  paymentStatusSchema,
} from '../validators/booking.validator.js';
import { createMessageSchema } from '../validators/message.validator.js';
import { confirmPaymentSchema, disputePaymentSchema } from '../validators/finance.validator.js';
import { ROLES } from '../constants/index.js';
import * as controller from '../controllers/booking.controller.js';
import * as messageController from '../controllers/message.controller.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

// BR-7: every booking endpoint requires authentication.
router.use(authenticateUser);

router.post('/', bookingLimiter, requireCustomer, validate({ body: createBookingSchema }), controller.create);
router.get('/my', requireRole(ROLES.CUSTOMER, ROLES.PROVIDER), validate({ query: listBookingsQuery }), controller.listMine);
router.get('/:id', validate({ params: idParams }), controller.getById);
router.patch(
  '/:id/status',
  requireRole(ROLES.PROVIDER, ROLES.ADMIN),
  validate({ params: idParams, body: updateBookingStatusSchema }),
  controller.updateStatus,
);
router.patch(
  '/:id/payment',
  requireRole(ROLES.PROVIDER, ROLES.ADMIN),
  validate({ params: idParams, body: paymentStatusSchema }),
  controller.updatePayment,
);
router.get('/:id/cancellation-preview', requireCustomer, validate({ params: idParams }), controller.cancellationPreview);
router.patch('/:id/cancel', requireCustomer, validate({ params: idParams, body: cancelBookingSchema }), controller.cancel);

router.get('/:id/payment', validate({ params: idParams }), paymentController.getForBooking);
router.patch(
  '/:id/payment/customer-confirm',
  requireCustomer,
  validate({ params: idParams, body: confirmPaymentSchema }),
  paymentController.customerConfirm,
);
router.patch(
  '/:id/payment/provider-confirm',
  requireRole(ROLES.PROVIDER),
  validate({ params: idParams, body: confirmPaymentSchema }),
  paymentController.providerConfirm,
);
router.post(
  '/:id/payment/dispute',
  requireRole(ROLES.CUSTOMER, ROLES.PROVIDER),
  validate({ params: idParams, body: disputePaymentSchema }),
  paymentController.dispute,
);

router.get('/:id/messages', validate({ params: idParams }), messageController.list);
router.post(
  '/:id/messages',
  requireRole(ROLES.CUSTOMER, ROLES.PROVIDER),
  validate({ params: idParams, body: createMessageSchema }),
  messageController.send,
);

export default router;
