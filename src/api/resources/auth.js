/**
 * Auth — `/auth/*`
 *
 * Every registration creates a brand-new organization with the caller as OWNER
 * (there is no invite/user-management API). `register` and `login` return
 * `{ user, tokens: { accessToken, refreshToken } }`; `refresh` returns
 * `{ accessToken, refreshToken }`. All four write-through to {@link tokenStore}
 * so the rest of the app stays in sync.
 */

import { http } from '../client.js';
import { tokenStore } from '../tokenStore.js';

export const auth = {
  /**
   * Create an organization + its first user (OWNER). 409 if the email exists.
   * @param {{ organizationName: string, email: string, password: string, firstName: string, lastName: string }} payload
   */
  async register(payload, options) {
    const session = await http.post('/auth/register', payload, { ...options, auth: false });
    tokenStore.setSession(session);
    return session;
  },

  /**
   * Exchange credentials for a token pair. 401 on bad credentials.
   * @param {{ email: string, password: string }} payload
   */
  async login(payload, options) {
    const session = await http.post('/auth/login', payload, { ...options, auth: false });
    tokenStore.setSession(session);
    return session;
  },

  /** Current user resolved from the access token. */
  me(options) {
    return http.get('/auth/me', options);
  },

  /**
   * Rotate the refresh token (single-use, family-tracked). Reusing a spent
   * token revokes the whole family (401). Defaults to the stored refresh token.
   * @param {string} [refreshToken]
   */
  async refresh(refreshToken = tokenStore.getRefreshToken(), options) {
    const tokens = await http.post('/auth/refresh', { refreshToken }, { ...options, auth: false });
    tokenStore.setTokens(tokens);
    return tokens;
  },

  /**
   * Revoke a refresh token (idempotent). Clears local auth state regardless of
   * outcome.
   * @param {string} [refreshToken]
   */
  async logout(refreshToken = tokenStore.getRefreshToken(), options) {
    try {
      return await http.post('/auth/logout', { refreshToken }, options);
    } finally {
      tokenStore.clear();
    }
  },
};
