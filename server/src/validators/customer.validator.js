import { z } from 'zod';
import { trimmed, requiredText, postalCode } from './common.validator.js';
import { PAKISTAN_PROVINCES, ADDRESS_LABELS } from '../constants/index.js';

export const addressSchema = z
  .object({
    label: z.enum(ADDRESS_LABELS).default('home'),
    houseNumber: trimmed(40).optional(),
    street: trimmed(120).optional(),
    area: requiredText('Area', 1, 120),
    city: requiredText('City', 1, 80),
    district: trimmed(80).optional(),
    province: z.enum(PAKISTAN_PROVINCES),
    postalCode: z.union([postalCode, z.literal('')]).optional(),
    additionalDetails: trimmed(200).optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const updateAddressSchema = addressSchema.partial();

export const addressIdParams = z.object({ addressId: trimmed(80).min(1, 'Address ID is required') });
