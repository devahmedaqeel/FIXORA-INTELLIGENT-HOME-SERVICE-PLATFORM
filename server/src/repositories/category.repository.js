import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class CategoryRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.CATEGORIES);
  }

  findAll({ activeOnly = false } = {}) {
    const filters = activeOnly ? [['active', '==', true]] : [];
    return this.findWhere(filters);
  }

  findBySlug(slug) {
    return this.findOneWhere([['slug', '==', slug]]);
  }
}

export const categoryRepository = new CategoryRepository();
