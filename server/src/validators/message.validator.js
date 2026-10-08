import { z } from 'zod';
import { requiredText } from './common.validator.js';

export const createMessageSchema = z.object({ text: requiredText('Message', 1, 2000) }).strict();
