import { Router } from 'express';
import { authenticateUser, requireCustomer } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParams } from '../validators/common.validator.js';
import * as controller from '../controllers/customer.controller.js';

const router = Router();

router.use(authenticateUser, requireCustomer);
router.get('/dashboard', controller.dashboard);
router.get('/saved-providers', controller.listSaved);
router.get('/saved-providers/ids', controller.savedIds);
router.post('/saved-providers/:id', validate({ params: idParams }), controller.save);
router.delete('/saved-providers/:id', validate({ params: idParams }), controller.unsave);

export default router;
