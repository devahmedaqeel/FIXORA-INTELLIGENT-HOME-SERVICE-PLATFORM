import { z } from 'zod';
import { WEEKDAYS } from '../constants/index.js';
import { isoDate, time, trimmed, docId } from './common.validator.js';
import { timeToMinutes } from '../utils/time.js';

const daySchema = z
  .object({
    enabled: z.boolean(),
    start: time.optional().default('09:00'),
    end: time.optional().default('17:00'),
  })
  .refine((d) => !d.enabled || timeToMinutes(d.start) < timeToMinutes(d.end), {
    message: 'End time must be after start time',
  });

export const updateAvailabilitySchema = z
  .object({
    weekly: z.object(Object.fromEntries(WEEKDAYS.map((day) => [day, daySchema]))),
    exceptions: z
      .array(z.object({ date: isoDate, reason: trimmed(120).optional().default('') }))
      .max(120)
      .optional()
      .default([]),
    slotIntervalMinutes: z.coerce.number().int().refine((v) => [15, 30, 60].includes(v), 'Slot interval must be 15, 30 or 60').optional(),
    bufferMinutes: z.coerce.number().int().min(0).max(120).optional(),
  })
  .strict();

export const slotsQuery = z.object({
  date: isoDate,
  serviceId: docId.optional(),
});
