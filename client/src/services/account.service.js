import { api } from './apiClient';

/* Profile */
export const getMe = () => api.get('/users/me');
export const updateMe = (changes) => api.put('/users/me', changes);
export const deleteMe = () => api.delete('/users/me', { confirm: 'DELETE' });

/* Customer */
export const getCustomerDashboard = () => api.get('/customers/dashboard');
export const listSavedProviders = () => api.get('/customers/saved-providers');
export const getSavedProviderIds = () => api.get('/customers/saved-providers/ids');
export const saveProvider = (id) => api.post(`/customers/saved-providers/${id}`);
export const unsaveProvider = (id) => api.delete(`/customers/saved-providers/${id}`);

/* Notifications */
export const listNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

/* Complaints */
export const createComplaint = (data) => api.post('/complaints', data);
export const listMyComplaints = (params) => api.getPage('/complaints/my', params);
