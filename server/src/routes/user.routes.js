import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateMeSchema, deleteMeSchema } from '../validators/user.validator.js';
import * as controller from '../controllers/user.controller.js';

const router = Router();

router.use(authenticateUser);
router.get('/me', controller.getMe);
router.put('/me', validate({ body: updateMeSchema }), controller.updateMe);
router.delete('/me', validate({ body: deleteMeSchema }), controller.deleteMe);

export default router;
