import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class ComplaintRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.COMPLAINTS);
  }

  findByUser(userId) {
    return this.findWhere([['userId', '==', userId]], { orderBy: ['createdAt', 'desc'] });
  }

  findAll(status) {
    return this.findWhere(status ? [['status', '==', status]] : [], { orderBy: ['createdAt', 'desc'] });
  }
}

export const complaintRepository = new ComplaintRepository();
