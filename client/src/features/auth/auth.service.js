import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../firebase';
import { api } from '../../services/apiClient';

/*
 * Registration: Firebase Auth account → ID token → POST /api/auth/register creates the
 * Firestore profile with the chosen role (customer/provider only; enforced server-side).
 */
export async function registerAccount({ email, password, displayName, role, phone, city }) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  try {
    await updateProfile(credential.user, { displayName });
    const session = await api.post('/auth/register', { role, displayName, phone: phone || '', city: city || '' });
    sendEmailVerification(credential.user).catch(() => {});
    return session;
  } catch (error) {
    // Roll back the half-created auth user so the person can retry with the same email.
    await credential.user.delete().catch(() => {});
    throw error;
  }
}

/** For a Firebase user whose Fixora profile is missing (e.g. interrupted sign-up). */
export const completeProfile = ({ displayName, role, phone, city }) =>
  api.post('/auth/register', { role, displayName, phone: phone || '', city: city || '' });

export async function signIn(email, password) {
  await signInWithEmailAndPassword(auth, email.trim(), password);
  return api.post('/auth/verify');
}

export const fetchSession = () => api.post('/auth/verify');

export const signOutUser = () => signOut(auth);

export const requestPasswordReset = (email) => sendPasswordResetEmail(auth, email.trim());

export const resendVerificationEmail = () => (auth.currentUser ? sendEmailVerification(auth.currentUser) : Promise.resolve());

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

