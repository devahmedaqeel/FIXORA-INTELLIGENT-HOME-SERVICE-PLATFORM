import { Router } from 'express';
import { authenticateUser, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { chatbotLimiter } from '../middleware/rateLimit.middleware.js';
import { chatMessageSchema } from '../validators/chatbot.validator.js';
import * as controller from './chatbot.controller.js';

const router = Router();

// Guests can ask general questions; account data needs a valid token.
router.post('/message', chatbotLimiter, optionalAuth, validate({ body: chatMessageSchema }), controller.message);
router.get('/quick-replies', optionalAuth, controller.quickReplies);
router.get('/history', authenticateUser, controller.history);

export default router;
