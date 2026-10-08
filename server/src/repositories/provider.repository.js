import { BaseRepository } from './base.repository.js';
import { COLLECTIONS, VERIFICATION_STATUS } from '../constants/index.js';

class ProviderRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.PROVIDERS);
  }

  findVerifiedByArea(areaId) {
    return this.findWhere([
      ['verificationStatus', '==', VERIFICATION_STATUS.VERIFIED],
      ['areaIds', 'array-contains', areaId],
    ]);
  }

  findVerifiedByPostalCode(postalCode) {
    return this.findWhere([
      ['verificationStatus', '==', VERIFICATION_STATUS.VERIFIED],
      ['postalCodes', 'array-contains', postalCode],
    ]);
  }

  findVerifiedByCategory(categoryId) {
    return this.findWhere([
      ['verificationStatus', '==', VERIFICATION_STATUS.VERIFIED],
      ['categoryIds', 'array-contains', categoryId],
    ]);
  }

  findVerified(limit) {
    return this.findWhere([['verificationStatus', '==', VERIFICATION_STATUS.VERIFIED]], limit ? { limit } : {});
  }

  findByStatus(status) {
    const filters = status ? [['verificationStatus', '==', status]] : [];
    return this.findWhere(filters, { orderBy: ['createdAt', 'desc'] });
  }
}

export const providerRepository = new ProviderRepository();
