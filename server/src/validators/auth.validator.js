import { z } from 'zod';
import { SELF_REGISTER_ROLES } from '../constants/index.js';
import { requiredText, optionalPhone } from './common.validator.js';

/**
 * Registration completes a Firebase Auth account by creating the Firestore profile.
 * Only customer/provider can be self-assigned — admins are created via the create-admin script.
 */
export const registerSchema = z
  .object({
    role: z.enum(SELF_REGISTER_ROLES, { errorMap: () => ({ message: 'Role must be customer or provider' }) }),
    displayName: requiredText('Full name', 2, 80),
    phone: optionalPhone,
    city: z.string().trim().max(80).optional(),
  })
  .strict();
