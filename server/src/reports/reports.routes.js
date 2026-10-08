import { Router } from 'express';
import { authenticateUser, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { reportRangeQuery } from '../validators/admin.validator.js';
import * as controller from './reports.controller.js';

/** Admin-only reports. Mounted at both /api/reports and /api/admin/reports. */
const router = Router();

router.use(authenticateUser, requireAdmin);
router.get('/', validate({ query: reportRangeQuery }), controller.summary);
router.get('/summary', validate({ query: reportRangeQuery }), controller.summary);
router.get('/bookings', validate({ query: reportRangeQuery }), controller.bookings);
router.get('/providers', validate({ query: reportRangeQuery }), controller.providers);
router.get('/categories', validate({ query: reportRangeQuery }), controller.categories);
router.get('/users', validate({ query: reportRangeQuery }), controller.users);

export default router;
