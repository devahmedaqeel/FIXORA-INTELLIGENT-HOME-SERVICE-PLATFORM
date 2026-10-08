import { Router } from 'express';
import { authenticateUser, requireCustomer } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParams } from '../validators/common.validator.js';
import { addressSchema, updateAddressSchema, addressIdParams } from '../validators/customer.validator.js';
import * as controller from '../controllers/customer.controller.js';

const router = Router();

router.use(authenticateUser, requireCustomer);
router.get('/dashboard', controller.dashboard);
router.get('/saved-providers', controller.listSaved);
router.get('/saved-providers/ids', controller.savedIds);
router.post('/saved-providers/:id', validate({ params: idParams }), controller.save);
router.delete('/saved-providers/:id', validate({ params: idParams }), controller.unsave);

router.get('/addresses', controller.listAddresses);
router.post('/addresses', validate({ body: addressSchema }), controller.addAddress);
router.put('/addresses/:addressId', validate({ params: addressIdParams, body: updateAddressSchema }), controller.updateAddress);
router.delete('/addresses/:addressId', validate({ params: addressIdParams }), controller.deleteAddress);

export default router;
