import { z } from 'zod';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../constants/index.js';
import { docId, isoDate, time, requiredText, trimmed, paginationQuery } from './common.validator.js';

export const createBookingSchema = z
  .object({
    providerId: docId,
    serviceId: docId,
    bookingDate: isoDate,
    startTime: time,
    customerAddress: requiredText('Address', 5, 300),
    areaId: docId.optional(),
    customerNotes: trimmed(1000).optional().default(''),
    customerPhone: trimmed(20).optional(),
  })
  .strict();

export const updateBookingStatusSchema = z
  .object({
    status: z.enum(Object.values(BOOKING_STATUS), { errorMap: () => ({ message: 'Invalid booking status' }) }),
    providerNotes: trimmed(1000).optional(),
    paymentStatus: z.enum(Object.values(PAYMENT_STATUS)).optional(),
  })
  .strict();

export const cancelBookingSchema = z
  .object({
    reason: trimmed(500).optional().default(''),
    acknowledgeLateCancellation: z.boolean().optional().default(false),
  })
  .strict();

export const listBookingsQuery = paginationQuery.extend({
  status: z.enum(Object.values(BOOKING_STATUS)).optional(),
  scope: z.enum(['upcoming', 'past', 'all']).optional(),
});

export const adminListBookingsQuery = listBookingsQuery.extend({
  providerId: docId.optional(),
  customerId: docId.optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
});

export const paymentStatusSchema = z
  .object({ paymentStatus: z.enum(Object.values(PAYMENT_STATUS)) })
  .strict();
