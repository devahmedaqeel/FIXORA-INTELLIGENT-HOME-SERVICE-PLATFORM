import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class BookingRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.BOOKINGS);
  }

  findByCustomer(customerId) {
    return this.findWhere([['customerId', '==', customerId]], { orderBy: ['bookingDate', 'desc'] });
  }

  findByProvider(providerId) {
    return this.findWhere([['providerId', '==', providerId]], { orderBy: ['bookingDate', 'desc'] });
  }

  /** Bookings for one provider on one date — used for slot generation and conflict checks. */
  providerDayQuery(providerId, bookingDate) {
    return this.buildQuery([
      ['providerId', '==', providerId],
      ['bookingDate', '==', bookingDate],
    ]);
  }

  async findProviderDay(providerId, bookingDate) {
    const snap = await this.providerDayQuery(providerId, bookingDate).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  findAll() {
    return this.findWhere([], { orderBy: ['createdAt', 'desc'] });
  }
}

export const bookingRepository = new BookingRepository();
