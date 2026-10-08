import { z } from 'zod';
import { COMPLAINT_TYPES, COMPLAINT_STATUS, REVIEW_STATUS } from '../constants/index.js';
import { docId, requiredText, trimmed, paginationQuery } from './common.validator.js';

/* ---------- Reviews ---------- */

const rating = z.coerce
  .number({ invalid_type_error: 'Rating must be a number' })
  .int('Rating must be a whole number')
  .min(1, 'Rating must be between 1 and 5')
  .max(5, 'Rating must be between 1 and 5');

export const createReviewSchema = z
  .object({
    bookingId: docId,
    rating,
    comment: trimmed(1000).optional().default(''),
  })
  .strict();

export const updateReviewSchema = z
  .object({ rating: rating.optional(), comment: trimmed(1000).optional() })
  .strict();

export const moderateReviewSchema = z
  .object({
    status: z.enum(Object.values(REVIEW_STATUS)),
    moderationNote: trimmed(300).optional(),
  })
  .strict();

/* ---------- Complaints ---------- */

export const createComplaintSchema = z
  .object({
    type: z.enum(COMPLAINT_TYPES, { errorMap: () => ({ message: 'Choose a complaint type' }) }),
    bookingId: docId.optional(),
    providerId: docId.optional(),
    subject: requiredText('Subject', 5, 120),
    description: requiredText('Description', 20, 3000),
  })
  .strict()
  .refine((d) => d.type !== 'booking' || d.bookingId, { message: 'Select the booking this complaint is about', path: ['bookingId'] });

export const updateComplaintSchema = z
  .object({
    status: z.enum(Object.values(COMPLAINT_STATUS)),
    adminResponse: trimmed(2000).optional(),
  })
  .strict();

export const listComplaintsQuery = paginationQuery.extend({
  status: z.enum(Object.values(COMPLAINT_STATUS)).optional(),
});
