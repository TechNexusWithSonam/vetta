/**
 * Runtime configuration for the API client.
 *
 * The AI SDR SaaS backend (NestJS) is reached through a single base URL. Every
 * request in the Postman collection is `{{baseUrl}}` + a path, so the client
 * only needs to know that base.
 *
 * Resolution order:
 *  1. `VITE_API_BASE_URL` if set (see `.env.example`).
 *  2. In the Vite dev server: `/api` — a same-origin path that `vite.config.js`
 *     proxies to the backend, sidestepping the backend's `localhost:3000`-only
 *     CORS policy.
 *  3. Otherwise (production build, Node tooling): the hosted backend URL.
 */

const HOSTED_BASE_URL = 'https://vetta-backend.vercel.app';

// `import.meta.env` is injected by Vite in the app build; guard it so the
// module also loads under plain Node (tooling, tests).
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

const DEFAULT_BASE_URL = env.DEV ? '/api' : HOSTED_BASE_URL;

/** Base URL with any trailing slash removed. */
export const API_BASE_URL = String(env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(
  /\/+$/,
  '',
);

/**
 * How long (ms) to wait for a response before aborting. `0` disables the
 * timeout. Override with `VITE_API_TIMEOUT_MS`.
 */
export const API_TIMEOUT_MS = Number(env.VITE_API_TIMEOUT_MS ?? 30000);

/** localStorage keys used by {@link module:api/tokenStore}. */
export const STORAGE_KEYS = {
  accessToken: 'vetta.auth.accessToken',
  refreshToken: 'vetta.auth.refreshToken',
  user: 'vetta.auth.user',
};
