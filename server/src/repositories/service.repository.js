import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class ServiceRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.SERVICES);
  }

  findByProvider(providerId, { activeOnly = false } = {}) {
    const filters = [['providerId', '==', providerId]];
    if (activeOnly) filters.push(['active', '==', true]);
    return this.findWhere(filters);
  }

  findActiveByCategory(categoryId) {
    return this.findWhere([
      ['categoryId', '==', categoryId],
      ['active', '==', true],
    ]);
  }
}

export const serviceRepository = new ServiceRepository();
