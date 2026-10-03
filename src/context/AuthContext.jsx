/**
 * Auth session state for the app, backed by the `api.auth.*` client.
 *
 * - On first mount, if a token is already stored it calls `GET /auth/me` to
 *   hydrate the user (and clears the session on a real HTTP error).
 * - `login` / `register` persist the `{ user, tokens }` result and expose the
 *   user; `logout` revokes the refresh token and clears local state.
 * - `status` is `'loading' | 'authenticated' | 'unauthenticated'`.
 * - Derived gates for post-auth routing:
 *     `needsVerification`   — user just registered, or `/auth/me` reports the
 *                             address unverified.
 *     `onboardingComplete`  — the lightweight onboarding wizard has been
 *                             finished (or skipped) for this user.
 * - Thin passthroughs for the password-reset / email-verification endpoints so
 *   screens don't import the api client directly.
 *
 * Consume it with `useAuth()` from `./useAuth`.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api, ApiError, tokenStore } from '../api';
import { AuthContext } from './authStore.js';
import { isOnboardingComplete, completeOnboarding } from '../lib/onboarding.js';

/** A user whose email the backend flags as unverified. */
function userIsUnverified(user) {
  if (!user) return false;
  return user.emailVerified === false || user.isVerified === false;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser());
  const [status, setStatus] = useState(
    tokenStore.isAuthenticated() ? 'loading' : 'unauthenticated',
  );
  // Set right after `register()` — carries the address into /verify-email even
  // though the backend has no per-user "verified" flag yet.
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(() =>
    isOnboardingComplete(tokenStore.getUser()?.id),
  );

  // Keep the onboarding flag in sync with whichever user is active.
  useEffect(() => {
    setOnboardingDone(isOnboardingComplete(user?.id));
  }, [user?.id]);

  // Hydrate the current user from the stored token. Re-runs safely under
  // StrictMode's mount/unmount/remount: a `runId` guard makes only the latest
  // invocation allowed to commit state, so a superseded run never wins or hangs.
  const runIdRef = useRef(0);
  useEffect(() => {
    const runId = ++runIdRef.current;
    const current = () => runId === runIdRef.current;

    if (!tokenStore.isAuthenticated()) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    (async () => {
      try {
        const me = await api.auth.me();
        if (!current()) return;
        tokenStore.setUser(me);
        setUser(me);
        setStatus('authenticated');
      } catch (err) {
        if (!current()) return;
        const transient = err instanceof ApiError && err.statusCode === 0; // offline / DNS / abort
        if (transient) {
          // Can't verify right now — keep the stored session and let real
          // requests (with their 401 -> refresh) sort it out.
          setStatus('authenticated');
        } else {
          // Any real HTTP status from /auth/me (401/400/403/5xx) => the token
          // is no good; force a clean login instead of a half-broken session.
          tokenStore.clear();
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    })();

    return () => {
      // Invalidate this run; the remount's run will re-fetch and commit.
      runIdRef.current += 1;
    };
  }, []);

  // Keep local state in sync if tokens are cleared elsewhere (e.g. a failed
  // refresh inside the client).
  useEffect(
    () =>
      tokenStore.subscribe(() => {
        if (!tokenStore.isAuthenticated()) {
          setUser(null);
          setStatus('unauthenticated');
          setPendingVerificationEmail(null);
        }
      }),
    [],
  );

  const login = useCallback(async (credentials) => {
    const session = await api.auth.login(credentials);
    setUser(session.user ?? null);
    setPendingVerificationEmail(null);
    setOnboardingDone(isOnboardingComplete(session.user?.id));
    setStatus('authenticated');
    return session;
  }, []);

  const register = useCallback(async (payload) => {
    const session = await api.auth.register(payload);
    setUser(session.user ?? null);
    setPendingVerificationEmail(payload.email || session.user?.email || null);
    setOnboardingDone(false);
    setStatus('authenticated');
    return session;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      // Local onboarding state is deliberately kept — a returning user
      // shouldn't have to redo the wizard after signing back in.
      setUser(null);
      setPendingVerificationEmail(null);
      setStatus('unauthenticated');
    }
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await api.auth.me();
    tokenStore.setUser(me);
    setUser(me);
    return me;
  }, []);

  const markOnboardingComplete = useCallback(
    (answers) => {
      if (user?.id) completeOnboarding(user.id, answers);
      setOnboardingDone(true);
    },
    [user?.id],
  );

  const clearPendingVerification = useCallback(() => {
    setPendingVerificationEmail(null);
  }, []);

  // Confirm an email with the token from the link, then re-hydrate the user.
  const verifyEmail = useCallback(
    async (token) => {
      const result = await api.auth.verifyEmail(token);
      setPendingVerificationEmail(null);
      try {
        if (tokenStore.isAuthenticated()) await refreshMe();
      } catch {
        /* verification succeeded; a stale /me is not fatal */
      }
      return result;
    },
    [refreshMe],
  );

  const forgotPassword = useCallback((email) => api.auth.forgotPassword(email), []);
  const resetPassword = useCallback((payload) => api.auth.resetPassword(payload), []);
  const resendVerification = useCallback(
    (email) => api.auth.resendVerification(email || pendingVerificationEmail || user?.email),
    [pendingVerificationEmail, user?.email],
  );

  const needsVerification =
    status === 'authenticated' &&
    (Boolean(pendingVerificationEmail) || userIsUnverified(user));

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      needsVerification,
      pendingVerificationEmail: pendingVerificationEmail || user?.email || null,
      onboardingComplete: onboardingDone,
      login,
      register,
      logout,
      refreshMe,
      markOnboardingComplete,
      clearPendingVerification,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
    }),
    [
      user,
      status,
      needsVerification,
      pendingVerificationEmail,
      onboardingDone,
      login,
      register,
      logout,
      refreshMe,
      markOnboardingComplete,
      clearPendingVerification,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
