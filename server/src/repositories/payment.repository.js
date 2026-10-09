import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

/** One document per booking, id == bookingId, so creation is naturally idempotent. */
class PaymentRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.PAYMENTS);
  }

  findByCustomer(customerId) {
    return this.findWhere([['customerId', '==', customerId]], { orderBy: ['createdAt', 'desc'] });
  }

  findByProvider(providerId) {
    return this.findWhere([['providerId', '==', providerId]], { orderBy: ['createdAt', 'desc'] });
  }

  findAll(status) {
    return this.findWhere(status ? [['status', '==', status]] : [], { orderBy: ['createdAt', 'desc'] });
  }
}

export const paymentRepository = new PaymentRepository();
