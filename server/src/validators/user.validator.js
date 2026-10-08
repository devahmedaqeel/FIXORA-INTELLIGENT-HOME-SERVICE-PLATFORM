import { z } from 'zod';
import { trimmed, optionalPhone, httpsUrl, docId } from './common.validator.js';

export const updateMeSchema = z
  .object({
    displayName: trimmed(80).min(2, 'Name must be at least 2 characters').optional(),
    phone: optionalPhone,
    city: trimmed(80).optional(),
    address: trimmed(300).optional(),
    defaultAreaId: z.union([docId, z.literal('')]).optional(),
    photoURL: z.union([httpsUrl, z.literal('')]).optional(),
  })
  .strict();

export const deleteMeSchema = z
  .object({
    confirm: z.literal('DELETE', { errorMap: () => ({ message: 'Type DELETE to confirm account deletion' }) }),
  })
  .strict();
