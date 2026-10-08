import { api } from './apiClient';

/* Categories */
export const listCategories = (includeInactive = false) => api.get('/categories', { params: includeInactive ? { includeInactive: true } : {} });
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

/* Areas (public lookup) */
export const searchAreas = (params) => api.getPage('/areas/search', params);
export const getAreaFacets = () => api.get('/areas/facets', { auth: false });
export const getArea = (id) => api.get(`/areas/${id}`);

/* Areas (admin) */
export const adminListAreas = (params) => api.getPage('/admin/areas', params);
export const createArea = (data) => api.post('/admin/areas', data);
export const updateArea = (id, data) => api.put(`/admin/areas/${id}`, data);
export const deleteArea = (id) => api.delete(`/admin/areas/${id}`);

/* Public platform config */
export const getPlatformConfig = () => api.get('/config', { auth: false });
