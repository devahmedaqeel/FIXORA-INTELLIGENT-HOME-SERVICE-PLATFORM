import { z } from 'zod';
import { requiredText, trimmed, postalCode, postalCodePrefix, paginationQuery, booleanString } from './common.validator.js';
import { UK_CONSTITUENT_COUNTRIES } from '../constants/index.js';

/* ---------- Categories ---------- */

export const createCategorySchema = z
  .object({
    name: requiredText('Category name', 2, 60),
    description: trimmed(300).optional().default(''),
    icon: trimmed(40).optional().default('wrench'),
    active: z.boolean().optional().default(true),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    name: requiredText('Category name', 2, 60).optional(),
    description: trimmed(300).optional(),
    icon: trimmed(40).optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const listCategoriesQuery = z.object({ includeInactive: booleanString.optional() });

/* ---------- Areas ---------- */

const areaFields = {
  areaName: requiredText('Area name', 2, 100),
  city: requiredText('City', 2, 60),
  district: requiredText('County', 2, 60),
  province: z.enum(UK_CONSTITUENT_COUNTRIES, { errorMap: () => ({ message: 'Select a valid UK country (England, Scotland, Wales or Northern Ireland)' }) }),
  postalCode,
  country: z.literal('United Kingdom').optional().default('United Kingdom'),
  active: z.boolean().optional().default(true),
};

export const createAreaSchema = z.object(areaFields).strict();

export const updateAreaSchema = z
  .object({
    areaName: areaFields.areaName.optional(),
    city: areaFields.city.optional(),
    district: areaFields.district.optional(),
    province: areaFields.province.optional(),
    postalCode: postalCode.optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const searchAreasQuery = paginationQuery.extend({
  q: z.string().trim().max(80).optional(),
  postalCode: postalCodePrefix.optional(),
  city: z.string().trim().max(60).optional(),
  province: z.string().trim().max(60).optional(),
  includeInactive: booleanString.optional(),
});
