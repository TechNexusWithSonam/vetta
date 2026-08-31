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
  const hydratedRef = useRef(false);

  // Hydrate the current user from the stored token exactly once.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (!tokenStore.isAuthenticated()) {
      setStatus('unauthenticated');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const me = await api.auth.me();
        if (cancelled) return;
        tokenStore.setUser(me);
        setUser(me);
        setStatus('authenticated');
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 401) {
          tokenStore.clear();
          setUser(null);
          setStatus('unauthenticated');
        } else {
          // Network / server hiccup — keep the stored session, trust the token.
          setStatus('authenticated');
        }
      }
    })();

    return () => {
      cancelled = true;
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
