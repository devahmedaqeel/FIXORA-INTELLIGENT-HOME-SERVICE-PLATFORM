import { api } from './apiClient';

export const getAdminDashboard = () => api.get('/admin/dashboard');

export const listUsers = (params) => api.getPage('/admin/users', params);
export const getUser = (id) => api.get(`/admin/users/${id}`);
export const updateUserStatus = (id, status, reason) => api.patch(`/admin/users/${id}/status`, { status, reason });

export const listProviders = (params) => api.getPage('/admin/providers', params);
export const getProviderDetail = (id) => api.get(`/admin/providers/${id}`);
export const setProviderVerification = (id, status, note) => api.patch(`/admin/providers/${id}/verification`, { status, note });

export const listBookings = (params) => api.getPage('/admin/bookings', params);
export const updateBookingStatus = (id, status) => api.patch(`/admin/bookings/${id}/status`, { status });

export const listReviews = (params) => api.getPage('/admin/reviews', params);
export const moderateReview = (id, status, moderationNote) => api.patch(`/admin/reviews/${id}`, { status, moderationNote });

export const listComplaints = (params) => api.getPage('/admin/complaints', params);
export const updateComplaint = (id, data) => api.patch(`/admin/complaints/${id}`, data);

export const listChatbotQueries = (params) => api.getPage('/admin/chatbot-queries', params);
export const resolveChatbotQuery = (id, resolved, adminNote) => api.patch(`/admin/chatbot-queries/${id}`, { resolved, adminNote });

export const getSettings = () => api.get('/admin/settings');
export const updateSettings = (data) => api.put('/admin/settings', data);

export const getReportSummary = (months) => api.get('/admin/reports/summary', { params: { months } });

export const listAdmins = () => api.get('/admin/admins');
export const listPendingInvites = () => api.get('/admin/invites');
export const createAdminInvite = (email) => api.post('/admin/invites', { email });
