import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class CustomerRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.CUSTOMERS);
  }
}

export const customerRepository = new CustomerRepository();
