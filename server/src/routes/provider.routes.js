import { Router } from 'express';
import { authenticateUser, optionalAuth, requireProvider } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParams, paginationQuery } from '../validators/common.validator.js';
import { searchProvidersQuery, updateProviderProfileSchema } from '../validators/provider.validator.js';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator.js';
import { updateAvailabilitySchema, slotsQuery } from '../validators/availability.validator.js';
import * as controller from '../controllers/provider.controller.js';

const router = Router();
const providerOnly = [authenticateUser, requireProvider];

/* Public discovery */
router.get('/', validate({ query: searchProvidersQuery }), controller.search);
router.get('/featured', controller.featured);
router.get('/recent-reviews', controller.recentReviews);

/* Signed-in provider: own profile, services, availability, stats (declared before /:id) */
router.get('/profile', providerOnly, controller.getOwnProfile);
router.put('/profile', providerOnly, validate({ body: updateProviderProfileSchema }), controller.updateOwnProfile);
router.get('/dashboard', providerOnly, controller.dashboard);
router.get('/earnings', providerOnly, validate({ query: paginationQuery }), controller.earnings);
router.get('/my-reviews', providerOnly, validate({ query: paginationQuery }), controller.ownReviews);

router.get('/services', providerOnly, controller.listOwnServices);
router.get('/services/:id', providerOnly, validate({ params: idParams }), controller.getOwnService);
router.post('/services', providerOnly, validate({ body: createServiceSchema }), controller.createService);
router.put('/services/:id', providerOnly, validate({ params: idParams, body: updateServiceSchema }), controller.updateService);
router.delete('/services/:id', providerOnly, validate({ params: idParams }), controller.deleteService);

router.get('/availability', providerOnly, controller.getOwnAvailability);
router.put('/availability', providerOnly, validate({ body: updateAvailabilitySchema }), controller.updateOwnAvailability);

/* Public provider profile */
router.get('/:id', optionalAuth, validate({ params: idParams }), controller.getById);
router.get('/:id/reviews', validate({ params: idParams, query: paginationQuery }), controller.reviews);
router.get('/:id/availability', validate({ params: idParams }), controller.availability);
router.get('/:id/slots', validate({ params: idParams, query: slotsQuery }), controller.slots);

export default router;
