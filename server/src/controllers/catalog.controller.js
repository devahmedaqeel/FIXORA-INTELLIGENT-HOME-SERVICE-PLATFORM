import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as categoryService from '../services/category.service.js';
import * as areaService from '../services/area.service.js';
import { ROLES } from '../constants/index.js';

/* ---------- Categories ---------- */

export const listCategories = asyncHandler(async (req, res) => {
  // Only admins may see inactive categories (BR-4).
  const includeInactive = Boolean(req.query.includeInactive) && req.user?.role === ROLES.ADMIN;
  sendSuccess(res, { data: await categoryService.listCategories({ includeInactive }) });
});

export const getCategory = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await categoryService.getCategory(req.params.id) }),
);

export const createCategory = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await categoryService.createCategory(req.body), message: 'Category created', statusCode: 201 }),
);

export const updateCategory = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await categoryService.updateCategory(req.params.id, req.body), message: 'Category updated' }),
);

export const deleteCategory = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await categoryService.deleteCategory(req.params.id), message: 'Category deleted' }),
);

/* ---------- Areas ---------- */

export const searchAreas = asyncHandler(async (req, res) => {
  const includeInactive = Boolean(req.query.includeInactive) && req.user?.role === ROLES.ADMIN;
  const { items, meta } = await areaService.searchAreas({ ...req.query, includeInactive });
  sendSuccess(res, { data: items, meta });
});

export const areaFacets = asyncHandler(async (_req, res) => sendSuccess(res, { data: await areaService.getAreaFacets() }));

export const getArea = asyncHandler(async (req, res) => sendSuccess(res, { data: await areaService.getArea(req.params.id) }));

export const createArea = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await areaService.createArea(req.body), message: 'Area created', statusCode: 201 }),
);

export const updateArea = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await areaService.updateArea(req.params.id, req.body), message: 'Area updated' }),
);

export const deleteArea = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await areaService.deleteArea(req.params.id), message: 'Area deleted' }),
);
