import { Router } from 'express';
import { z } from 'zod';
import { authenticateUser, requireProvider } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { docId } from '../validators/common.validator.js';
import { updateAvailabilitySchema, slotsQuery } from '../validators/availability.validator.js';
import * as controller from '../controllers/provider.controller.js';

const router = Router();
const providerParams = z.object({ providerId: docId });

/** Map :providerId → :id so the provider controller can be reused. */
const asIdParam = (req, _res, next) => {
  req.params.id = req.params.providerId;
  next();
};

router.get('/me', authenticateUser, requireProvider, controller.getOwnAvailability);
router.put('/me', authenticateUser, requireProvider, validate({ body: updateAvailabilitySchema }), controller.updateOwnAvailability);
router.get('/:providerId', validate({ params: providerParams }), asIdParam, controller.availability);
router.get('/:providerId/slots', validate({ params: providerParams, query: slotsQuery }), asIdParam, controller.slots);

export default router;
