import { api } from '../../services/apiClient';

/* Public discovery */
export const searchProviders = (params) =>
  api.getPage('/providers', params).then(({ items, meta, message }) => ({ ...items, meta, message }));
export const getRecentReviews = () => api.get('/providers/recent-reviews', { auth: false });
export const getFeaturedProviders = () => api.get('/providers/featured', { auth: false });
export const getProviderProfile = (id) => api.get(`/providers/${id}`);
export const getProviderReviews = (id, params) => api.getPage(`/providers/${id}/reviews`, params);
export const getAvailableSlots = (providerId, date, serviceId) => api.get(`/providers/${providerId}/slots`, { params: { date, serviceId }, auth: false });

/* Signed-in provider */
export const getOwnProfile = () => api.get('/providers/profile');
export const updateOwnProfile = (changes) => api.put('/providers/profile', changes);
export const getProviderDashboard = () => api.get('/providers/dashboard');
export const getEarnings = (params) => api.getPage('/providers/earnings', params);
export const getOwnReviews = (params) => api.getPage('/providers/my-reviews', params);

export const listOwnServices = () => api.get('/providers/services');
export const getOwnService = (id) => api.get(`/providers/services/${id}`);
export const createService = (data) => api.post('/providers/services', data);
export const updateService = (id, data) => api.put(`/providers/services/${id}`, data);
export const deleteService = (id) => api.delete(`/providers/services/${id}`);

export const getOwnAvailability = () => api.get('/providers/availability');
export const updateOwnAvailability = (data) => api.put('/providers/availability', data);
