import { z } from 'zod';
import { trimmed, optionalPhone, httpsUrl, docId, postalCode, paginationQuery, isoDate } from './common.validator.js';

export const updateProviderProfileSchema = z
  .object({
    displayName: trimmed(80).min(2, 'Name must be at least 2 characters').optional(),
    businessName: trimmed(100).optional(),
    bio: trimmed(1500).optional(),
    phone: optionalPhone,
    whatsapp: optionalPhone,
    showPhonePublicly: z.boolean().optional(),
    experienceYears: z.coerce.number().int().min(0).max(70).optional(),
    photoURL: z.union([httpsUrl, z.literal('')]).optional(),
    categoryIds: z.array(docId).max(12, 'Choose at most 12 categories').optional(),
    areaIds: z.array(docId).max(50, 'Choose at most 50 service areas').optional(),
    verificationDocuments: z
      .array(z.object({ name: trimmed(120).min(1), url: httpsUrl, path: trimmed(300).optional() }))
      .max(5)
      .optional(),
  })
  .strict();

export const searchProvidersQuery = paginationQuery.extend({
  categoryId: docId.optional(),
  areaId: docId.optional(),
  postalCode: postalCode.optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  availableOn: isoDate.optional(),
  sort: z.enum(['rating', 'price_asc', 'price_desc', 'reviews']).optional(),
  q: z.string().trim().max(80).optional(),
});

export const providerIdParams = z.object({ id: docId });
