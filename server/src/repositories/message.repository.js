import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class MessageRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.MESSAGES);
  }

  findByBooking(bookingId) {
    return this.findWhere([['bookingId', '==', bookingId]]);
  }

  findUnreadForBooking(bookingId, recipientId) {
    return this.findWhere([
      ['bookingId', '==', bookingId],
      ['receiverId', '==', recipientId],
      ['read', '==', false],
    ]);
  }
}

export const messageRepository = new MessageRepository();
