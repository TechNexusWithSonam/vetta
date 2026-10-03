/**
 * Research — `/research/*`
 *
 * type: COMPANY_RESEARCH | PERSON_RESEARCH | INDUSTRY_RESEARCH | COMPETITOR_RESEARCH
 * (only COMPANY_RESEARCH is wired up; the rest return 422 "not implemented yet").
 * Starting/retrying is AI-triggering and throttled. `costAnalytics` is declared
 * before `/research/:id` server-side so the literal segment is not captured.
 *
 * `start` / `list` / `get` / `retry` return a job STATUS VIEW, not the raw row:
 *   {
 *     id, status: 'queued'|'processing'|'completed'|'failed'|'cancelled',
 *     stale: boolean, attempts, provider, model, queueJobId,
 *     error: { code, message } | null,   // only when status === 'failed'
 *     createdAt, startedAt, completedAt, failedAt, updatedAt,
 *     result?: object                     // only when status === 'completed'
 *   }
 * error.code ∈ QUEUE_UNAVAILABLE | REDIS_CONNECTION_FAILED | PROVIDER_CONFIG_MISSING |
 *   PROVIDER_REQUEST_FAILED | PROVIDER_TIMEOUT | SCHEMA_VALIDATION_FAILED |
 *   LEAD_NOT_FOUND | PROMPT_NOT_CONFIGURED | JOB_STALE | UNKNOWN
 */

import { http } from '../client.js';

export const research = {
  /**
   * @param {{ leadId: string, type: string }} payload
   * Throws ApiError 503 with `body.code` (QUEUE_UNAVAILABLE / REDIS_CONNECTION_FAILED)
   * when the queue could not accept the job — no phantom pending row is left.
   */
  start(payload, options) {
    return http.post('/research', payload, options);
  },

  /** @param {{ page?: number, limit?: number }} [params] — items are status views */
  list(params, options) {
    return http.get('/research', { ...options, query: params });
  },

  /**
   * Cost totals. `from`/`to` default to a trailing 30-day window.
   * @param {{ from?: string, to?: string }} [params]
   */
  costAnalytics(params, options) {
    return http.get('/research/cost-analytics', { ...options, query: params });
  },

  /**
   * Infra snapshot: { database, redis, queue, worker:{running,lastSeenAt,count},
   * provider:{configured,default,claude,openai}, jobs:{pending,processing,stalePending},
   * healthy }. Booleans/counts only — no credentials. Auth required, any role.
   */
  diagnostics(options) {
    return http.get('/research/diagnostics', options);
  },

  /** 404 "Research job not found" if missing/cross-tenant. */
  get(researchId, options) {
    return http.get(`/research/${researchId}`, options);
  },

  /**
   * Re-run a job. 404 if missing/cross-tenant. 409 if the job is already
   * completed, or is actively processing (and not past the stale timeout).
   * AI-triggering.
   */
  retry(researchId, options) {
    return http.post(`/research/${researchId}/retry`, undefined, options);
  },

  /** `AiUsageLog[]` — provider, model, tokens, cost, latency. */
  providerLogs(researchId, options) {
    return http.get(`/research/${researchId}/provider-logs`, options);
  },
};
