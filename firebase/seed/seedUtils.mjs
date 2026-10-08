/*
 * Seed helpers. Firebase Admin is loaded through the server's config module so seeds use the
 * exact same credentials (server/.env) and the server's node_modules.
 */
import { getAuth, getDb } from '../../server/src/config/firebase.js';
import { assertServerConfig } from '../../server/src/config/environment.js';
import { ukOffsetMinutes } from '../../server/src/utils/time.js';

export { getAuth, getDb, assertServerConfig };

export const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const areaId = (area) => slugify(`${area.city}-${area.areaName}-${area.postalCode}`);
export const categoryId = (name) => slugify(name);

export const nowIso = () => new Date().toISOString();

/** Returns YYYY-MM-DD in UK local time (GMT/BST-aware), offset by n days. */
export const ukDate = (offsetDays = 0) => {
  const base = new Date(Date.now() + offsetDays * 86400000);
  const shifted = new Date(base.getTime() + ukOffsetMinutes(base) * 60000);
  return shifted.toISOString().slice(0, 10);
};

/** Creates the Firebase Auth user, or returns the existing one with the same email. */
export async function ensureAuthUser({ email, password, displayName }) {
  const auth = getAuth();
  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    return auth.createUser({ email, password, displayName, emailVerified: true });
  }
}

export async function writeInBatches(writes) {
  const db = getDb();
  for (let i = 0; i < writes.length; i += 400) {
    const batch = db.batch();
    for (const { ref, data } of writes.slice(i, i + 400)) batch.set(ref, data, { merge: true });
    await batch.commit();
  }
}
