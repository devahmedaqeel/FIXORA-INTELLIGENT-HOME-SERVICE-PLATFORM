import { BaseRepository } from './base.repository.js';
import { COLLECTIONS } from '../constants/index.js';

class SettingsRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.SETTINGS);
  }
}

export const settingsRepository = new SettingsRepository();
