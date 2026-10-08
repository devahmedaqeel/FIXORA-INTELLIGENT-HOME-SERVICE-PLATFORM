import { z } from 'zod';

/** Reusable field schemas. Every request body is validated server-side regardless of the client. */

export const trimmed = (max = 200) => z.string().trim().max(max, `Must be at most ${max} characters`);

export const requiredText = (label, min = 1, max = 200) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

export const docId = z
  .string({ required_error: 'ID is required' })
  .trim()
  .min(1, 'ID is required')
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid ID format');

export const idParams = z.object({ id: docId });

export const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);

export const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

/** UK mobile/landline: +447911123456, 07911123456, 02079460958. */
export const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => /^(\+44|0)\d{9,10}$/.test(v), 'Enter a valid UK phone number, e.g. 07911123456');

export const optionalPhone = z.union([phone, z.literal('')]).optional();

/** UK postcode, e.g. "SW1A 1AA". Normalised to uppercase with a single space before the inward code. */
export const postalCode = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase().replace(/\s+/g, ''))
  .refine((v) => /^[A-Z]{1,2}\d[A-Z0-9]?\d[A-Z]{2}$/.test(v), 'Enter a valid UK postcode, e.g. SW1A 1AA')
  .transform((v) => `${v.slice(0, -3)} ${v.slice(-3)}`);

/** Partial postcode for prefix search (e.g. "SW1A" or "M1") — letters/digits only, no full-format check. */
export const postalCodePrefix = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase().replace(/\s+/g, ''))
  .refine((v) => /^[A-Z0-9]{1,8}$/.test(v), 'Enter a valid UK postcode or prefix');

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v), 'Invalid date');

export const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm (24-hour) format');

export const price = z.coerce
  .number({ invalid_type_error: 'Price must be a number' })
  .min(0, 'Price cannot be negative')
  .max(10_000_000, 'Price is too high');

export const httpsUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .refine((v) => v.startsWith('https://'), 'URL must use https');

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const booleanString = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((v) => v === true || v === 'true');
