import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

/** One document per booking, id == bookingId, so creation is naturally idempotent. */
class CommissionRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.COMMISSIONS);
  }

  findByProvider(providerId) {
    return this.findWhere([['providerId', '==', providerId]], { orderBy: ['createdAt', 'desc'] });
  }

  findByStatus(status) {
    return this.findWhere([['status', '==', status]]);
  }

  findAll() {
    return this.findWhere([], { orderBy: ['createdAt', 'desc'] });
  }
}

export const commissionRepository = new CommissionRepository();
