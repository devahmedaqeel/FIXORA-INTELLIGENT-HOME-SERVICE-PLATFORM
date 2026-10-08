import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class BookingLockRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.BOOKING_LOCKS);
  }

  lockId(providerId, bookingDate) {
    return `${providerId}_${bookingDate}`;
  }
}

export const bookingLockRepository = new BookingLockRepository();
