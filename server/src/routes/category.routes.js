import { Router } from 'express';
import { authenticateUser, optionalAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParams } from '../validators/common.validator.js';
import { createCategorySchema, updateCategorySchema, listCategoriesQuery } from '../validators/catalog.validator.js';
import * as controller from '../controllers/catalog.controller.js';

const router = Router();
const adminOnly = [authenticateUser, requireAdmin];

router.get('/', optionalAuth, validate({ query: listCategoriesQuery }), controller.listCategories);
router.get('/:id', validate({ params: idParams }), controller.getCategory);
router.post('/', adminOnly, validate({ body: createCategorySchema }), controller.createCategory);
router.put('/:id', adminOnly, validate({ params: idParams, body: updateCategorySchema }), controller.updateCategory);
router.delete('/:id', adminOnly, validate({ params: idParams }), controller.deleteCategory);

export default router;
