import { Router } from 'express';
import { authenticateUser, verifyFirebaseToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { registerSchema } from '../validators/auth.validator.js';
import * as controller from '../controllers/auth.controller.js';

/*
 * Passwords never touch this API — Firebase Authentication handles sign-up, sign-in,
 * email verification and password reset on the client. These endpoints link the
 * Firebase identity to a Fixora profile and role.
 */
const router = Router();

router.use(authLimiter);
router.post('/register', verifyFirebaseToken, validate({ body: registerSchema }), controller.register);
router.post('/verify', authenticateUser, controller.verify);

export default router;
