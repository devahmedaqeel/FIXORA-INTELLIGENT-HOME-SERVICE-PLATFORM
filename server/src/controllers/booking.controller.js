import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as bookingService from '../services/booking.service.js';

export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    data: await bookingService.createBooking(req.user, req.body),
    message: 'Booking created successfully',
    statusCode: 201,
  }),
);

export const listMine = asyncHandler(async (req, res) => {
  const { items, meta } = await bookingService.listMyBookings(req.user, req.query);
  sendSuccess(res, { data: items, meta });
});

export const getById = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await bookingService.getBookingForUser(req.params.id, req.user) }),
);

export const updateStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    data: await bookingService.updateBookingStatus(req.user, req.params.id, req.body),
    message: `Booking ${req.body.status.replace('_', ' ')}`,
  }),
);

export const updatePayment = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    data: await bookingService.updatePaymentStatus(req.user, req.params.id, req.body.paymentStatus),
    message: 'Payment status updated',
  }),
);

export const cancellationPreview = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await bookingService.getCancellationPreview(req.user, req.params.id) }),
);

export const cancel = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await bookingService.cancelBooking(req.user, req.params.id, req.body), message: 'Booking cancelled' }),
);
