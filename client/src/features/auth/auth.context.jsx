import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseReady } from '../../firebase';
import * as authService from './auth.service';

/*
 * Auth state for the whole app:
 *   firebaseUser — Firebase Auth user (or null)
 *   user         — Fixora profile from the API, including the server-assigned role
 *   provider     — provider record for provider accounts
 *   needsProfile — signed in to Firebase but no Fixora profile yet
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ firebaseUser: null, user: null, provider: null, loading: firebaseReady, needsProfile: false, error: '' });
  const registering = useRef(false);

  const applySession = useCallback((session) => {
    setState((s) => ({ ...s, user: session.user, provider: session.provider, needsProfile: false, loading: false, error: '' }));
    return session;
  }, []);

  const loadSession = useCallback(async () => {
    try {
      return applySession(await authService.fetchSession());
    } catch (error) {
      const needsProfile = error.errorCode === 'PROFILE_NOT_FOUND';
      setState((s) => ({ ...s, user: null, provider: null, needsProfile, loading: false, error: needsProfile ? '' : error.message }));
      return null;
    }
  }, [applySession]);

  useEffect(() => {
    if (!firebaseReady) return undefined;
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setState((s) => ({ ...s, firebaseUser, loading: Boolean(firebaseUser) && !registering.current }));
      if (!firebaseUser) {
        setState({ firebaseUser: null, user: null, provider: null, loading: false, needsProfile: false, error: '' });
        return;
      }
      // During sign-up the profile is created by register(); avoid racing it.
      if (!registering.current) await loadSession();
    });
  }, [loadSession]);

  const value = useMemo(
    () => ({
      ...state,
      role: state.user?.role || null,
      isAuthenticated: Boolean(state.firebaseUser && state.user),
      async login(email, password) {
        return applySession(await authService.signIn(email, password));
      },
      /**
       * Signs in via the same Firebase flow as login(), then rejects (and signs out) anyone
       * whose server-assigned role isn't admin. Guarded by `registering` so the global
       * onAuthStateChanged listener never races in with its own session load for a
       * non-admin account between sign-in and the role check completing.
       */
      async adminLogin(email, password) {
        registering.current = true;
        try {
          const session = await authService.signIn(email, password);
          if (session.user.role !== 'admin') {
            await authService.signOutUser();
            throw Object.assign(new Error('This account is not an administrator.'), { errorCode: 'NOT_ADMIN' });
          }
          return applySession(session);
        } finally {
          registering.current = false;
        }
      },
      async adminSignup(data) {
        registering.current = true;
        try {
          return applySession(await authService.adminSignup(data));
        } finally {
          registering.current = false;
        }
      },
      async loginWithGoogle() {
        const fbUser = await authService.signInWithGoogle();
        try {
          const session = await authService.fetchSession();
          return applySession(session);
        } catch (error) {
          if (error.errorCode === 'PROFILE_NOT_FOUND') {
            setState((s) => ({ ...s, firebaseUser: fbUser, user: null, provider: null, needsProfile: true, loading: false }));
            return { needsProfile: true, user: null };
          }
          throw error;
        }
      },
      async register(data) {
        registering.current = true;
        try {
          return applySession(await authService.registerAccount(data));
        } finally {
          registering.current = false;
        }
      },
      async completeProfile(data) {
        return applySession(await authService.completeProfile(data));
      },
      async logout() {
        await authService.signOutUser();
      },
      refreshSession: loadSession,
      /** Merge a locally updated profile/provider without a round trip. */
      updateLocal(patch) {
        setState((s) => ({ ...s, ...patch }));
      },
    }),
    [state, applySession, loadSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
