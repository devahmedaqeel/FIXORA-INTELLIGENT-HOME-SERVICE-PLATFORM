import { api } from '../../services/apiClient';

/** The user's identity is taken from the auth token on the server — never sent in the body. */
export const sendChatMessage = (message, history = []) => api.post('/chatbot/message', { message, history });
export const getChatHistory = () => api.get('/chatbot/history');
export const getQuickReplies = () => api.get('/chatbot/quick-replies');
