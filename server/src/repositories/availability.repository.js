import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class AvailabilityRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.AVAILABILITY);
  }
}

export const availabilityRepository = new AvailabilityRepository();
