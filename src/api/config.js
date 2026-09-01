/**
 * Runtime configuration for the API client.
 *
 * The AI SDR SaaS backend (NestJS) is reached through a single base URL. Every
 * request in the Postman collection is `{{baseUrl}}` + a path, so the client
 * only needs to know that base.
 *
 * Resolution order:
 *  1. `VITE_API_BASE_URL` if set (see `.env.example`).
 *  2. In any Vite build (dev server *or* production): `/api` — a same-origin
 *     path proxied to the backend. In dev that proxy lives in `vite.config.js`;
 *     in production it's a rewrite in `vercel.json`. Both sidestep the backend's
 *     restrictive CORS policy (no cross-origin request, no preflight).
 *  3. Otherwise (plain Node tooling, tests): the hosted backend URL directly.
 */

const HOSTED_BASE_URL = 'https://vetta-backend.vercel.app';

// `import.meta.env` is injected by Vite in the app build; guard it so the
// module also loads under plain Node (tooling, tests).
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

// `DEV` or `PROD` is always set inside a Vite bundle; neither is set under Node.
const DEFAULT_BASE_URL = env.DEV || env.PROD ? '/api' : HOSTED_BASE_URL;

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
