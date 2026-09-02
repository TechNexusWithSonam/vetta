/**
 * Auth session state for the app, backed by the `api.auth.*` client.
 *
 * - On first mount, if a token is already stored it calls `GET /auth/me` to
 *   hydrate the user (and clears the session on a 401).
 * - `login` / `register` persist the `{ user, tokens }` result and expose the
 *   user; `logout` revokes the refresh token and clears local state.
 * - `status` is `'loading' | 'authenticated' | 'unauthenticated'`.
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser());
  const [status, setStatus] = useState(
    tokenStore.isAuthenticated() ? 'loading' : 'unauthenticated',
  );

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
        }
      }),
    [],
  );

  const login = useCallback(async (credentials) => {
    const session = await api.auth.login(credentials);
    setUser(session.user ?? null);
    setStatus('authenticated');
    return session;
  }, []);

  const register = useCallback(async (payload) => {
    const session = await api.auth.register(payload);
    setUser(session.user ?? null);
    setStatus('authenticated');
    return session;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await api.auth.me();
    tokenStore.setUser(me);
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, status, login, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
