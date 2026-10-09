import { z } from 'zod';
import { COMMISSION_STATUS, PAYMENT_CONFIRMATION_STATUS, PAYMENT_METHODS } from '../constants/index.js';
import { docId, httpsUrl, paginationQuery, requiredText, trimmed } from './common.validator.js';

export const confirmPaymentSchema = z
  .object({
    method: z.enum(PAYMENT_METHODS),
    reference: trimmed(120).optional().default(''),
  })
  .strict();

export const disputePaymentSchema = z.object({ reason: requiredText('Reason', 10, 1000) }).strict();

export const resolveDisputeSchema = z
  .object({
    resolution: z.enum(['paid', 'refunded']),
    note: trimmed(500).optional().default(''),
  })
  .strict();

export const listPaymentsQuery = paginationQuery.extend({
  status: z.enum(Object.values(PAYMENT_CONFIRMATION_STATUS)).optional(),
  providerId: docId.optional(),
  customerId: docId.optional(),
  q: z.string().trim().max(80).optional(),
});

export const submitCommissionPaymentSchema = z
  .object({
    method: z.enum(PAYMENT_METHODS),
    reference: trimmed(120).optional().default(''),
    proofUrl: z.union([httpsUrl, z.literal('')]).optional().default(''),
    proofPath: trimmed(300).optional().default(''),
    amountGBP: z.coerce.number().positive('Amount must be greater than zero').max(1_000_000),
  })
  .strict();

export const disputeCommissionSchema = z.object({ reason: requiredText('Reason', 10, 1000) }).strict();

export const verifyCommissionSchema = z.object({ note: trimmed(500).optional().default('') }).strict();

export const rejectCommissionSchema = z.object({ reason: requiredText('Reason', 10, 1000) }).strict();

export const partialPaymentSchema = z
  .object({
    amountGBP: z.coerce.number().positive('Amount must be greater than zero').max(1_000_000),
    note: trimmed(500).optional().default(''),
  })
  .strict();

export const waiveCommissionSchema = z.object({ reason: requiredText('Reason', 10, 1000) }).strict();

export const listCommissionsQuery = paginationQuery.extend({
  status: z.enum(Object.values(COMMISSION_STATUS)).optional(),
  providerId: docId.optional(),
  q: z.string().trim().max(80).optional(),
});

export const listAuditLogsQuery = paginationQuery.extend({
  action: trimmed(60).optional(),
  bookingId: docId.optional(),
  commissionId: docId.optional(),
  actorId: docId.optional(),
});

export const paymentSettingsSchema = z
  .object({
    commissionRatePercent: z.coerce.number().min(0).max(100).optional(),
    commissionPaymentDeadlineDays: z.coerce.number().int().min(1).max(90).optional(),
    businessPaymentAccount: z
      .object({
        accountName: trimmed(120).optional(),
        bankName: trimmed(120).optional(),
        sortCode: trimmed(20).optional(),
        accountNumber: trimmed(30).optional(),
        iban: trimmed(40).optional(),
        swiftBic: trimmed(20).optional(),
      })
      .strict()
      .optional(),
    enabledCommissionPaymentMethods: z
      .object({ bank_transfer: z.boolean().optional(), cash: z.boolean().optional(), other: z.boolean().optional() })
      .strict()
      .optional(),
  })
  .strict();
