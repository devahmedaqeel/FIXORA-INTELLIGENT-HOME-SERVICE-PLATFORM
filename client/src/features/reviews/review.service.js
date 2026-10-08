import { api } from '../../services/apiClient';

export const createReview = (data) => api.post('/reviews', data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const getMyReviews = () => api.get('/reviews/my');
