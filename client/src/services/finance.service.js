import { api } from './apiClient';

/* Provider: commission self-service */
export const listMyCommissions = (params) => api.getPage('/commissions/my', params);
export const getMyCommission = (id) => api.get(`/commissions/my/${id}`);
export const submitCommissionPayment = (id, data) => api.post(`/commissions/my/${id}/submit-payment`, data);
export const disputeCommission = (id, reason) => api.post(`/commissions/my/${id}/dispute`, { reason });

/* Admin: payments */
export const listPayments = (params) => api.getPage('/admin/payments', params);
export const resolvePaymentDispute = (id, data) => api.post(`/admin/payments/${id}/resolve-dispute`, data);

/* Admin: commissions */
export const listCommissions = (params) => api.getPage('/admin/commissions', params);
export const getCommissionDetail = (id) => api.get(`/admin/commissions/${id}`);
export const verifyCommission = (id, note) => api.post(`/admin/commissions/${id}/verify`, { note });
export const rejectCommission = (id, reason) => api.post(`/admin/commissions/${id}/reject`, { reason });
export const recordPartialPayment = (id, data) => api.post(`/admin/commissions/${id}/partial-payment`, data);
export const waiveCommission = (id, reason) => api.post(`/admin/commissions/${id}/waive`, { reason });

/* Admin: reporting, audit log, payment settings */
export const getFinancialReports = () => api.get('/admin/financial-reports');
export const listAuditLogs = (params) => api.getPage('/admin/audit-logs', params);
export const getPaymentSettings = () => api.get('/admin/payment-settings');
export const updatePaymentSettings = (data) => api.put('/admin/payment-settings', data);
