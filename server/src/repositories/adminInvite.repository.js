import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

/** Doc id == invite token (a random, unguessable string) — lookup by id is the redemption path. */
class AdminInviteRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.ADMIN_INVITES);
  }

  findPending() {
    return this.findWhere([['used', '==', false]], { orderBy: ['createdAt', 'desc'] });
  }
}

export const adminInviteRepository = new AdminInviteRepository();
