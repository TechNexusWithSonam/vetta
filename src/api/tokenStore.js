/**
 * Persistent auth-token storage for the API client.
 *
 * The backend issues an access/refresh token pair from `POST /auth/register`,
 * `POST /auth/login` and `POST /auth/refresh` (shape: `{ user, tokens }` for the
 * first two, `{ accessToken, refreshToken }` for refresh). This module keeps
 * that pair — plus the current user — in `localStorage` so a page reload stays
 * authenticated, and lets the UI subscribe to auth-state changes.
 */

import { STORAGE_KEYS } from './config.js';

/** @returns {Storage|null} */
function storage() {
  try {
    return window.localStorage;
  } catch {
    return null; // SSR / privacy mode / disabled storage
  }
}

function read(key) {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value == null) storage()?.removeItem(key);
    else storage()?.setItem(key, value);
  } catch {
    /* ignore quota / disabled storage */
  }
}

/** @type {Set<() => void>} */
const listeners = new Set();

function emit() {
  for (const fn of listeners) {
    try {
      fn();
    } catch {
      /* a broken listener must not break the others */
    }
  }
}

export const tokenStore = {
  getAccessToken() {
    return read(STORAGE_KEYS.accessToken);
  },

  getRefreshToken() {
    return read(STORAGE_KEYS.refreshToken);
  },

  /** @returns {object|null} The persisted user object, or null. */
  getUser() {
    const raw = read(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(read(STORAGE_KEYS.accessToken));
  },

  /**
   * Persist a token pair. Accepts either the auth-response `tokens` object
   * (`{ accessToken, refreshToken }`) or loose args.
   * @param {{ accessToken?: string, refreshToken?: string }|string|null} tokensOrAccess
   * @param {string} [maybeRefresh]
   */
  setTokens(tokensOrAccess, maybeRefresh) {
    let accessToken;
    let refreshToken;
    if (tokensOrAccess && typeof tokensOrAccess === 'object') {
      accessToken = tokensOrAccess.accessToken;
      refreshToken = tokensOrAccess.refreshToken;
    } else {
      accessToken = tokensOrAccess ?? undefined;
      refreshToken = maybeRefresh;
    }
    if (accessToken !== undefined) write(STORAGE_KEYS.accessToken, accessToken);
    if (refreshToken !== undefined) write(STORAGE_KEYS.refreshToken, refreshToken);
    emit();
  },

  /** @param {object|null} user */
  setUser(user) {
    write(STORAGE_KEYS.user, user ? JSON.stringify(user) : null);
    emit();
  },

  /**
   * Store a full login/register result: `{ user, tokens }`.
   * @param {{ user?: object, tokens?: { accessToken: string, refreshToken: string } }} session
   */
  setSession(session) {
    if (!session) return;
    if (session.tokens) this.setTokens(session.tokens);
    if (session.user !== undefined) this.setUser(session.user);
  },

  /** Wipe all auth state (logout, or an unrecoverable 401). */
  clear() {
    write(STORAGE_KEYS.accessToken, null);
    write(STORAGE_KEYS.refreshToken, null);
    write(STORAGE_KEYS.user, null);
    emit();
  },

  /**
   * Subscribe to any auth-state change (token or user).
   * @param {() => void} listener
   * @returns {() => void} unsubscribe
   */
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
