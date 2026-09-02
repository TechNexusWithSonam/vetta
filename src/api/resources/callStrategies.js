/**
 * Call Strategy — `/call-strategies/*`
 *
 * strategyType: COLD_CALL | WARM_LEAD | EXISTING_CUSTOMER | FOLLOW_UP | CALLBACK | RE_ENGAGEMENT
 * (optional — auto-selected when omitted). Requires a COMPLETED research job for
 * the lead (422 otherwise). Generation is AI-triggering and throttled. Versions
 * are immutable: rollback creates a NEW version rather than mutating history.
 */

import { http } from '../client.js';

export const callStrategies = {
  /**
   * @param {{ leadId: string, campaignId?: string, researchJobId?: string,
   *   strategyType?: string, qualificationFrameworkId?: string }} payload
   */
  start(payload, options) {
    return http.post('/call-strategies', payload, options);
  },

  /** @param {{ page?: number, limit?: number, leadId?: string, campaignId?: string, status?: string }} [params] */
  list(params, options) {
    return http.get('/call-strategies', { ...options, query: params });
  },

  /** 404 "Call strategy not found" if missing/cross-tenant. */
  get(callStrategyId, options) {
    return http.get(`/call-strategies/${callStrategyId}`, options);
  },

  /** 409 unless current status is FAILED. AI-triggering. */
  retry(callStrategyId, options) {
    return http.post(`/call-strategies/${callStrategyId}/retry`, undefined, options);
  },

  /** Not paginated, version desc. */
  listVersions(callStrategyId, options) {
    return http.get(`/call-strategies/${callStrategyId}/versions`, options);
  },

  /** Returns `null` (200, not 404) when nothing is published yet. Cached. */
  publishedVersion(callStrategyId, options) {
    return http.get(`/call-strategies/${callStrategyId}/published-version`, options);
  },

  /**
   * Publish a version (OWNER, ADMIN). `versionId` defaults to the latest DRAFT.
   * Idempotent no-op if already PUBLISHED; 409 if the target is ARCHIVED.
   * @param {string} [versionId]
   */
  publish(callStrategyId, versionId, options) {
    return http.post(`/call-strategies/${callStrategyId}/publish`, { versionId }, options);
  },

  /**
   * Roll back by copying a target version's content into a new published
   * version (OWNER, ADMIN).
   * @param {string} targetVersionId
   */
  rollback(callStrategyId, targetVersionId, options) {
    return http.post(`/call-strategies/${callStrategyId}/rollback`, { targetVersionId }, options);
  },

  /** `AiUsageLog[]` for this generation, createdAt asc. */
  providerLogs(callStrategyId, options) {
    return http.get(`/call-strategies/${callStrategyId}/provider-logs`, options);
  },

  /** Plain array (not wrapped) despite accepting page/limit. */
  logs(callStrategyId, params, options) {
    return http.get(`/call-strategies/${callStrategyId}/logs`, { ...options, query: params });
  },
};
