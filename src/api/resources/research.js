/**
 * Research — `/research/*`
 *
 * type: COMPANY_RESEARCH | PERSON_RESEARCH | INDUSTRY_RESEARCH | COMPETITOR_RESEARCH
 * (only COMPANY_RESEARCH is wired up; the rest return 422 "not implemented yet").
 * Starting/retrying is AI-triggering and throttled. `costAnalytics` is declared
 * before `/research/:id` server-side so the literal segment is not captured.
 */

import { http } from '../client.js';

export const research = {
  /** @param {{ leadId: string, type: string }} payload */
  start(payload, options) {
    return http.post('/research', payload, options);
  },

  /** @param {{ page?: number, limit?: number }} [params] */
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

  /** 404 "Research job not found" if missing/cross-tenant. */
  get(researchId, options) {
    return http.get(`/research/${researchId}`, options);
  },

  /** Re-run a job. 422 (not 404) if missing/cross-tenant. AI-triggering. */
  retry(researchId, options) {
    return http.post(`/research/${researchId}/retry`, undefined, options);
  },

  /** `AiUsageLog[]` — provider, model, tokens, cost, latency. */
  providerLogs(researchId, options) {
    return http.get(`/research/${researchId}/provider-logs`, options);
  },
};
