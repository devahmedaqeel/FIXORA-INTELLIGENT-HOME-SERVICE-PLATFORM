import { api } from '../../services/apiClient';

export const createBooking = (data) => api.post('/bookings', data);
export const listMyBookings = (params) => api.getPage('/bookings/my', params);
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const updateBookingStatus = (id, data) => api.patch(`/bookings/${id}/status`, data);
export const updatePaymentStatus = (id, paymentStatus) => api.patch(`/bookings/${id}/payment`, { paymentStatus });
export const getCancellationPreview = (id) => api.get(`/bookings/${id}/cancellation-preview`);
export const cancelBooking = (id, { reason, acknowledgeLateCancellation }) =>
  api.patch(`/bookings/${id}/cancel`, { reason, acknowledgeLateCancellation });
