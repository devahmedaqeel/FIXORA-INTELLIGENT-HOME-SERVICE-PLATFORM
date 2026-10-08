import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParams } from '../validators/common.validator.js';
import { searchAreasQuery } from '../validators/catalog.validator.js';
import * as controller from '../controllers/catalog.controller.js';

/** Public area lookup. Area management lives under /api/admin/areas. */
const router = Router();

router.get('/', optionalAuth, validate({ query: searchAreasQuery }), controller.searchAreas);
router.get('/search', optionalAuth, validate({ query: searchAreasQuery }), controller.searchAreas);
router.get('/facets', controller.areaFacets);
router.get('/:id', validate({ params: idParams }), controller.getArea);

export default router;
