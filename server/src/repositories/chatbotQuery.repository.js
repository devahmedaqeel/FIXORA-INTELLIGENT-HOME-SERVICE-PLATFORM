import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class ChatbotQueryRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.CHATBOT_QUERIES);
  }

  findByUser(userId, limit = 50) {
    return this.findWhere([['userId', '==', userId]], { orderBy: ['createdAt', 'desc'], limit });
  }

  findAll({ resolved } = {}) {
    const filters = typeof resolved === 'boolean' ? [['resolved', '==', resolved]] : [];
    return this.findWhere(filters, { orderBy: ['createdAt', 'desc'] });
  }
}

export const chatbotQueryRepository = new ChatbotQueryRepository();
