#!/usr/bin/env node
/*
 * Creates (or promotes) an administrator. Admin role can never be self-assigned through the API.
 *   npm run create-admin -- --email you@example.com --password "Str0ngPass!" --name "Your Name"
 * If the email already exists in Firebase Auth, that user is promoted to admin.
 */
import { assertServerConfig, ensureAuthUser, getDb, nowIso } from './seedUtils.mjs';

const arg = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : undefined;
};

async function main() {
  const email = arg('email');
  const password = arg('password');
  const displayName = arg('name') || 'Fixora Admin';

  if (!email) throw new Error('Usage: npm run create-admin -- --email <email> --password <password> [--name <name>]');
  if (password && (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))) {
    throw new Error('Password must be at least 8 characters and include a letter and a number');
  }

  assertServerConfig();
  const user = await ensureAuthUser({ email, password: password || undefined, displayName });
  const ts = nowIso();
  const ref = getDb().collection('users').doc(user.uid);
  const existing = await ref.get();

  await ref.set(
    {
      uid: user.uid,
      email: email.toLowerCase(),
      displayName: existing.exists ? existing.data().displayName : displayName,
      role: 'admin',
      status: 'active',
      phone: existing.exists ? existing.data().phone || '' : '',
      city: '',
      address: '',
      photoURL: '',
      defaultAreaId: '',
      createdAt: existing.exists ? existing.data().createdAt : ts,
      updatedAt: ts,
    },
    { merge: true },
  );

  console.log(`✔ ${email} is now an administrator (uid ${user.uid}).`);
  process.exit(0);
}

main().catch((error) => {
  console.error('create-admin failed:', error.message);
  process.exit(1);
});
