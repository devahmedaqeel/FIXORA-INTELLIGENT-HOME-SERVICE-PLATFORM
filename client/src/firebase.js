import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

/*
 * Firebase client SDK: Authentication (sign-up, sign-in, password reset, email verification)
 * and Storage (profile photos, verification documents). All Firestore data access goes
 * through the Fixora REST API so business rules stay on the server.
 */

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseReady = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

const app = firebaseReady ? initializeApp(config) : null;

export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;
