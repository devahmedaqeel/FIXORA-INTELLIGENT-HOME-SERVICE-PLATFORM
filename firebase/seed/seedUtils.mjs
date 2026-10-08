/*
 * Seed helpers. Firebase Admin is loaded through the server's config module so seeds use the
 * exact same credentials (server/.env) and the server's node_modules.
 */
import { getAuth, getDb } from '../../server/src/config/firebase.js';
import { assertServerConfig } from '../../server/src/config/environment.js';

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

/** Returns YYYY-MM-DD in Pakistan time, offset by n days. */
export const pktDate = (offsetDays = 0) => {
  const d = new Date(Date.now() + 5 * 3600000 + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
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
