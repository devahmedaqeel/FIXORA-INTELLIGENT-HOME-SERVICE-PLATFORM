import { z } from 'zod';
import { trimmed, requiredText, postalCode } from './common.validator.js';
import { ADDRESS_LABELS } from '../constants/index.js';

export const addressSchema = z
  .object({
    label: z.enum(ADDRESS_LABELS).default('home'),
    addressLine1: requiredText('Address line 1', 1, 120),
    addressLine2: trimmed(120).optional(),
    city: requiredText('Town / city', 1, 80),
    county: trimmed(80).optional(),
    postcode: postalCode,
    country: z.literal('United Kingdom').optional().default('United Kingdom'),
    additionalDetails: trimmed(200).optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const updateAddressSchema = addressSchema.partial();

export const addressIdParams = z.object({ addressId: trimmed(80).min(1, 'Address ID is required') });
