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

/** Pakistani mobile/landline: +923001234567, 03001234567, 0512345678. */
export const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => /^(\+92|0)\d{9,10}$/.test(v), 'Enter a valid Pakistani phone number, e.g. 03001234567');

export const optionalPhone = z.union([phone, z.literal('')]).optional();

/** Pakistan Post codes are 5 digits. */
export const postalCode = z
  .string()
  .trim()
  .regex(/^\d{5}$/, 'Postal code must be 5 digits');

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
