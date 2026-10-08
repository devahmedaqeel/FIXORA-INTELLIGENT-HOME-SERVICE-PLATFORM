import { DASHBOARD_PATHS } from '../../constants';

export const dashboardPathFor = (role) => DASHBOARD_PATHS[role] || '/';

/** Only allow same-site relative redirects (prevents open-redirects via ?redirect=). */
export const safeRedirect = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : null);

const FIREBASE_MESSAGES = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
  'auth/weak-password': 'Please choose a stronger password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/user-disabled': 'This account has been disabled. Contact support for help.',
  'auth/requires-recent-login': 'For security, please sign out and sign in again, then retry.',
};

/** Turns Firebase or API errors into a human-readable message. */
export function authErrorMessage(error) {
  if (!error) return '';
  if (error.code && FIREBASE_MESSAGES[error.code]) return FIREBASE_MESSAGES[error.code];
  return error.message || 'Something went wrong. Please try again.';
}
