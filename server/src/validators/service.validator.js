import { z } from 'zod';
import { PRICING_TYPES } from '../constants/index.js';
import { requiredText, trimmed, price, docId, httpsUrl } from './common.validator.js';

const duration = z.coerce
  .number({ invalid_type_error: 'Duration must be a number' })
  .int('Duration must be whole minutes')
  .min(15, 'Duration must be at least 15 minutes')
  .max(720, 'Duration cannot exceed 12 hours');

export const createServiceSchema = z
  .object({
    categoryId: docId,
    title: requiredText('Title', 3, 100),
    description: trimmed(1500).optional().default(''),
    price,
    pricingType: z.enum(PRICING_TYPES, { errorMap: () => ({ message: 'Pricing type must be fixed, starting_from or hourly' }) }),
    duration,
    active: z.boolean().optional().default(true),
    imageURL: z.union([httpsUrl, z.literal('')]).optional(),
  })
  .strict();

export const updateServiceSchema = z
  .object({
    categoryId: docId.optional(),
    title: requiredText('Title', 3, 100).optional(),
    description: trimmed(1500).optional(),
    price: price.optional(),
    pricingType: z.enum(PRICING_TYPES).optional(),
    duration: duration.optional(),
    active: z.boolean().optional(),
    imageURL: z.union([httpsUrl, z.literal('')]).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, 'Provide at least one field to update');
