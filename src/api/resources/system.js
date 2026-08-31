/**
 * System / Health — `/health`, `/ready`, `/live` (all `@Public()`).
 *
 * `health` is a deep dependency check (Postgres, Redis, BullMQ, memory) — 200
 * when healthy, 503 otherwise (which surfaces as an {@link ApiError}). `ready`
 * and `live` are the Kubernetes probe targets.
 */

import { http } from '../client.js';

export const system = {
  health(options) {
    return http.get('/health', { ...options, auth: false });
  },
  ready(options) {
    return http.get('/ready', { ...options, auth: false });
  },
  live(options) {
    return http.get('/live', { ...options, auth: false });
  },
};
