import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as paymentService from '../services/paymentConfirmation.service.js';

export const customerConfirm = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await paymentService.confirmByCustomer(req.user, req.params.id, req.body), message: 'Payment confirmed' }),
);

export const providerConfirm = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await paymentService.confirmByProvider(req.user, req.params.id, req.body), message: 'Payment receipt confirmed' }),
);

export const getForBooking = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await paymentService.getPaymentForBooking(req.params.id, req.user) }),
);

export const dispute = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await paymentService.disputePayment(req.user, req.params.id, req.body), message: 'Payment disputed' }),
);

/* Admin */
export const listAll = asyncHandler(async (req, res) => {
  const { items, meta } = await paymentService.listAllPayments(req.query);
  sendSuccess(res, { data: items, meta });
});

export const resolveDispute = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await paymentService.resolveDispute(req.user, req.params.id, req.body), message: 'Dispute resolved' }),
);
