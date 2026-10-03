/**
 * Auth — `/auth/*`
 *
 * Every registration creates a brand-new organization with the caller as OWNER
 * (there is no invite/user-management API). `register` and `login` return
 * `{ user, tokens: { accessToken, refreshToken } }`; `refresh` returns
 * `{ accessToken, refreshToken }`. All four write-through to {@link tokenStore}
 * so the rest of the app stays in sync.
 *
 * `forgotPassword` / `resetPassword` / `verifyEmail` / `resendVerification`
 * target the conventional REST paths a NestJS auth module exposes. The deployed
 * backend does not implement them yet (see BACKEND_ISSUES.md); callers treat a
 * 404/405/501/network result as "endpoint not available" and degrade to a
 * privacy-preserving message rather than failing loudly. They start working the
 * moment the backend ships the routes — no frontend change required.
 */

import { API_BASE_URL } from '../config.js';
import { http } from '../client.js';
import { tokenStore } from '../tokenStore.js';

/** Statuses that mean "the backend has not shipped this route (yet)". */
export const AUTH_ENDPOINT_UNAVAILABLE = new Set([0, 404, 405, 501, 502, 503]);

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

  /**
   * Request a password-reset email. The response is intentionally uninformative
   * (never reveals whether the address has an account).
   * @param {string} email
   */
  forgotPassword(email, options) {
    return http.post('/auth/forgot-password', { email }, { ...options, auth: false });
  },

  /**
   * Complete a password reset with the token from the emailed link.
   * @param {{ token: string, password: string }} payload
   */
  resetPassword(payload, options) {
    return http.post('/auth/reset-password', payload, { ...options, auth: false });
  },

  /**
   * Confirm an email address with the token from the verification link.
   * @param {string} token
   */
  verifyEmail(token, options) {
    return http.post('/auth/verify-email', { token }, { ...options, auth: false });
  },

  /** Re-send the verification email for the given (or current) address. */
  resendVerification(email, options) {
    return http.post('/auth/resend-verification', { email }, { ...options, auth: false });
  },

  /**
   * Absolute URL that begins the hosted OAuth flow for a provider. The backend
   * handles the redirect + callback and lands the browser back on the app with
   * a token pair. 404s cleanly if the provider is not configured.
   * @param {'google'|'microsoft'} provider
   * @param {string} [redirectPath] Where to land after a successful sign-in.
   */
  oauthStartUrl(provider, redirectPath = '/dashboard') {
    const q = new URLSearchParams({ redirect: redirectPath }).toString();
    return `${API_BASE_URL}/auth/oauth/${provider}?${q}`;
  },
};
