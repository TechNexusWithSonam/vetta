/**
 * Real-call-first, mock-fallback data adapter.
 *
 * The Vetta backend does not have `/admin/*` endpoints yet (see
 * BACKEND_ISSUES.md). Rather than hardcode the Super Admin panel against mock
 * data, every admin resource function attempts the real proposed endpoint
 * first; only a "this route doesn't exist (yet)" style failure falls back to
 * realistic local demo data — mirroring the exact pattern
 * `src/api/resources/auth.js` already uses for its own not-yet-shipped
 * routes (`AUTH_ENDPOINT_UNAVAILABLE`). A genuine error (401/403/validation/
 * unexpected 5xx) is never masked.
 *
 * The moment the backend ships a real endpoint, this stops falling back
 * automatically — no UI change required.
 */
import { ApiError } from '../../api/ApiError.js';
import { sleep } from './sleep.js';

/** Statuses that mean "the backend has not shipped this route (yet)". */
export const ADMIN_ENDPOINT_UNAVAILABLE = new Set([0, 404, 405, 501, 502, 503]);

/**
 * @template A, T
 * @param {(...args: A) => Promise<T>} realFn
 * @param {(...args: A) => Promise<T>} mockFn
 * @returns {(...args: A) => Promise<{ data: T, isMock: boolean }>}
 */
export function withMockFallback(realFn, mockFn) {
  return async (...args) => {
    try {
      const data = await realFn(...args);
      return { data, isMock: false };
    } catch (err) {
      const unavailable = err instanceof ApiError && ADMIN_ENDPOINT_UNAVAILABLE.has(err.statusCode);
      if (!unavailable) throw err;
      await sleep(200); // keep the loading state feeling real rather than instant
      const data = await mockFn(...args);
      return { data, isMock: true };
    }
  };
}
