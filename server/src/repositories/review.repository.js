import { BaseRepository } from './base.repository.js';
import { COLLECTIONS, REVIEW_STATUS } from '../constants/index.js';

class ReviewRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.REVIEWS);
  }

  findPublishedByProvider(providerId) {
    return this.findWhere(
      [
        ['providerId', '==', providerId],
        ['status', '==', REVIEW_STATUS.PUBLISHED],
      ],
      { orderBy: ['createdAt', 'desc'] },
    );
  }

  findByCustomer(customerId) {
    return this.findWhere([['customerId', '==', customerId]], { orderBy: ['createdAt', 'desc'] });
  }

  findAll(status) {
    return this.findWhere(status ? [['status', '==', status]] : [], { orderBy: ['createdAt', 'desc'] });
  }
}

export const reviewRepository = new ReviewRepository();
