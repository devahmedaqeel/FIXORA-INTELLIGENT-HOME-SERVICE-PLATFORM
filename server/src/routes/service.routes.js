import { Router } from 'express';
import { authenticateUser, requireProvider } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParams } from '../validators/common.validator.js';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator.js';
import * as providerController from '../controllers/provider.controller.js';
import { asyncHandler, sendSuccess } from '../utils/http.js';
import { toPublicService } from '../utils/serializers.js';
import { getPublicServiceDetail } from '../services/serviceOffering.service.js';

/*
 * Resource-style alias of the provider service endpoints (/api/providers/services),
 * convenient for mobile clients, plus a public single-service read.
 */
const router = Router();
const providerOnly = [authenticateUser, requireProvider];

router.get('/mine', providerOnly, providerController.listOwnServices);
router.post('/', providerOnly, validate({ body: createServiceSchema }), providerController.createService);
router.put('/:id', providerOnly, validate({ params: idParams, body: updateServiceSchema }), providerController.updateService);
router.delete('/:id', providerOnly, validate({ params: idParams }), providerController.deleteService);

router.get(
  '/:id',
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const { service, providerName } = await getPublicServiceDetail(req.params.id);
    sendSuccess(res, { data: { ...toPublicService(service), providerName } });
  }),
);

export default router;
