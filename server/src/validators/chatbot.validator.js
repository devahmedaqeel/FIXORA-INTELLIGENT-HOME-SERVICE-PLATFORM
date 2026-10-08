import { z } from 'zod';
import { requiredText } from './common.validator.js';

// Note: there is deliberately no userId field. Identity comes only from the verified token,
// and .strict() rejects any attempt to pass one.
export const chatMessageSchema = z
  .object({
    message: requiredText('Message', 1, 500),
    history: z
      .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(1000) }))
      .max(10)
      .optional()
      .default([]),
  })
  .strict();
