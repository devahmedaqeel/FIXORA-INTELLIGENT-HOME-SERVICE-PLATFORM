import { api } from '../../services/apiClient';

export const createBooking = (data) => api.post('/bookings', data);
export const listMyBookings = (params) => api.getPage('/bookings/my', params);
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const updateBookingStatus = (id, data) => api.patch(`/bookings/${id}/status`, data);
export const updatePaymentStatus = (id, paymentStatus) => api.patch(`/bookings/${id}/payment`, { paymentStatus });
export const getCancellationPreview = (id) => api.get(`/bookings/${id}/cancellation-preview`);
export const cancelBooking = (id, { reason, acknowledgeLateCancellation }) =>
  api.patch(`/bookings/${id}/cancel`, { reason, acknowledgeLateCancellation });

export const listBookingMessages = (id) => api.get(`/bookings/${id}/messages`);
export const sendBookingMessage = (id, text) => api.post(`/bookings/${id}/messages`, { text });

export const getBookingPayment = (id) => api.get(`/bookings/${id}/payment`);
export const confirmPaymentAsCustomer = (id, data) => api.patch(`/bookings/${id}/payment/customer-confirm`, data);
export const confirmPaymentAsProvider = (id, data) => api.patch(`/bookings/${id}/payment/provider-confirm`, data);
export const disputeBookingPayment = (id, reason) => api.post(`/bookings/${id}/payment/dispute`, { reason });
