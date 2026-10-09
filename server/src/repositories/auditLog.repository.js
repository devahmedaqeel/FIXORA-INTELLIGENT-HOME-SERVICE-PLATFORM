import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.AUDIT_LOGS);
  }

  findRecent(limit = 200) {
    return this.findWhere([], { orderBy: ['createdAt', 'desc'], limit });
  }

  findByCommission(commissionId) {
    return this.findWhere([['commissionId', '==', commissionId]], { orderBy: ['createdAt', 'asc'] });
  }

  findByBooking(bookingId) {
    return this.findWhere([['bookingId', '==', bookingId]], { orderBy: ['createdAt', 'asc'] });
  }

  findByAction(action, limit = 200) {
    return this.findWhere([['action', '==', action]], { orderBy: ['createdAt', 'desc'], limit });
  }
}

export const auditLogRepository = new AuditLogRepository();
