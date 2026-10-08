import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.USERS);
  }

  findByRole(role) {
    return this.findWhere([['role', '==', role]], { orderBy: ['createdAt', 'desc'] });
  }

  findAll() {
    return this.findWhere([], { orderBy: ['createdAt', 'desc'] });
  }
}

export const userRepository = new UserRepository();
