import { z } from 'zod';
import { ACCOUNT_STATUS, ROLES, VERIFICATION_STATUS, LATE_CANCELLATION_POLICIES } from '../constants/index.js';
import { trimmed, paginationQuery, email, booleanString } from './common.validator.js';

export const listUsersQuery = paginationQuery.extend({
  role: z.enum(Object.values(ROLES)).optional(),
  status: z.enum(Object.values(ACCOUNT_STATUS)).optional(),
  q: z.string().trim().max(80).optional(),
});

export const updateUserStatusSchema = z
  .object({
    status: z.enum([ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.SUSPENDED]),
    reason: trimmed(300).optional(),
  })
  .strict();

export const listProvidersQuery = paginationQuery.extend({
  status: z.enum(Object.values(VERIFICATION_STATUS)).optional(),
  q: z.string().trim().max(80).optional(),
});

export const verifyProviderSchema = z
  .object({
    status: z.enum([VERIFICATION_STATUS.VERIFIED, VERIFICATION_STATUS.REJECTED, VERIFICATION_STATUS.SUSPENDED, VERIFICATION_STATUS.PENDING]),
    note: trimmed(500).optional().default(''),
  })
  .strict();

export const updateSettingsSchema = z
  .object({
    bookingCancellationCutoffMinutes: z.coerce.number().int().min(0).max(10080).optional(),
    lateCancellationPolicy: z.enum(LATE_CANCELLATION_POLICIES).optional(),
    lateCancellationFeePercent: z.coerce.number().min(0).max(100).optional(),
    slotIntervalMinutes: z.coerce.number().int().refine((v) => [15, 30, 60].includes(v), 'Slot interval must be 15, 30 or 60').optional(),
    maxAdvanceBookingDays: z.coerce.number().int().min(1).max(365).optional(),
    supportEmail: email.optional(),
    supportPhone: trimmed(30).optional(),
    platformName: trimmed(60).optional(),
  })
  .strict();

export const chatbotQueriesQuery = paginationQuery.extend({ resolved: booleanString.optional() });

export const resolveChatbotQuerySchema = z
  .object({ resolved: z.boolean(), adminNote: trimmed(500).optional() })
  .strict();

export const reportRangeQuery = z.object({
  months: z.coerce.number().int().min(1).max(24).optional().default(6),
});
