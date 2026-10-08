import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class AreaRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.AREAS);
  }

  findAll({ activeOnly = false } = {}) {
    return this.findWhere(activeOnly ? [['active', '==', true]] : []);
  }

  findByPostalCode(postalCode) {
    return this.findWhere([
      ['postalCode', '==', postalCode],
      ['active', '==', true],
    ]);
  }
}

export const areaRepository = new AreaRepository();
