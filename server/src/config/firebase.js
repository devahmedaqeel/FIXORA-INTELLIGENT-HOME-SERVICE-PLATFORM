import admin from 'firebase-admin';
import { env } from './environment.js';

/*
 * Single place where the Firebase Admin SDK is initialised. Everything else asks for
 * getDb() / getAuth() / getBucket() so tests can swap in doubles with setFirebaseOverrides().
 */

let app = null;
let overrides = null;

function initApp() {
  if (app) return app;
  const { projectId, clientEmail, privateKey, storageBucket } = env.firebase;

  // Inline service-account variables win; otherwise GOOGLE_APPLICATION_CREDENTIALS is used.
  const credential =
    projectId && clientEmail && privateKey
      ? admin.credential.cert({ projectId, clientEmail, privateKey })
      : admin.credential.applicationDefault();

  app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential,
        projectId: projectId || undefined,
        storageBucket: storageBucket || (projectId ? `${projectId}.appspot.com` : undefined),
      });
  return app;
}

let firestore = null;

export function getDb() {
  if (overrides?.db) return overrides.db;
  if (!firestore) {
    firestore = initApp().firestore();
    // Optional fields omitted by validators must never crash a write.
    firestore.settings({ ignoreUndefinedProperties: true });
  }
  return firestore;
}

export function getAuth() {
  if (overrides?.auth) return overrides.auth;
  return initApp().auth();
}

export function getBucket() {
  if (overrides?.bucket) return overrides.bucket;
  return initApp().storage().bucket();
}

/** Test hook: inject in-memory Firestore/Auth doubles. */
export function setFirebaseOverrides(next) {
  overrides = next;
}
