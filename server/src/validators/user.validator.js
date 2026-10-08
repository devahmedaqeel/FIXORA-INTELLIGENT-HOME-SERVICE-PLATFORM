import { z } from 'zod';
import { trimmed, optionalPhone, httpsUrl, docId } from './common.validator.js';

export const notificationPreferencesSchema = z
  .object({
    bookingUpdates: z.boolean().optional(),
    reviewUpdates: z.boolean().optional(),
    accountUpdates: z.boolean().optional(),
    promotional: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
  })
  .strict();

export const updateMeSchema = z
  .object({
    displayName: trimmed(80).min(2, 'Name must be at least 2 characters').optional(),
    phone: optionalPhone,
    city: trimmed(80).optional(),
    address: trimmed(300).optional(),
    defaultAreaId: z.union([docId, z.literal('')]).optional(),
    photoURL: z.union([httpsUrl, z.literal('')]).optional(),
    notificationPreferences: notificationPreferencesSchema.optional(),
  })
  .strict();

export const deleteMeSchema = z
  .object({
    confirm: z.literal('DELETE', { errorMap: () => ({ message: 'Type DELETE to confirm account deletion' }) }),
  })
  .strict();
