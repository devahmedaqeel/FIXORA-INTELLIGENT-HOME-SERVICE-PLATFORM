import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class NotificationRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.NOTIFICATIONS);
  }

  findByUser(userId, limit = 50) {
    return this.findWhere([['userId', '==', userId]], { orderBy: ['createdAt', 'desc'], limit });
  }

  findUnread(userId) {
    return this.findWhere([
      ['userId', '==', userId],
      ['read', '==', false],
    ]);
  }
}

export const notificationRepository = new NotificationRepository();
