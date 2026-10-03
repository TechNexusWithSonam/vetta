/**
 * Campaigns — `/campaigns/*` (includes campaign analytics + retry rules)
 *
 * Lifecycle: DRAFT -> READY -> SCHEDULED -> RUNNING <-> PAUSED, plus ARCHIVED.
 *  - `markReady`: DRAFT|SCHEDULED -> READY. Needs >=1 assigned lead + a schedule.
 *  - `configureSchedule`: READY -> SCHEDULED.
 *  - `start`: SCHEDULED -> RUNNING (OWNER, ADMIN).
 *  - `pause`: RUNNING -> PAUSED. `resume`: PAUSED -> RUNNING.
 *  - `archive`: legal from any status except RUNNING (409 from RUNNING).
 *  - `remove`: only DRAFT or ARCHIVED (409 otherwise). Soft delete, 204.
 */

import { http } from '../client.js';

export const campaigns = {
  /** @param {{ name: string, description?: string, templateId?: string, config?: object }} payload */
  create(payload, options) {
    return http.post('/campaigns', payload, options);
  },

  /** @param {{ page?: number, limit?: number, status?: string, templateId?: string, search?: string }} [params] */
  list(params, options) {
    return http.get('/campaigns', { ...options, query: params });
  },

  /** 404 if missing/cross-tenant (cached). */
  get(campaignId, options) {
    return http.get(`/campaigns/${campaignId}`, options);
  },

  /** @param {{ name?: string, description?: string, config?: object }} payload. 409 if ARCHIVED. */
  update(campaignId, payload, options) {
    return http.patch(`/campaigns/${campaignId}`, payload, options);
  },

  /** DRAFT|SCHEDULED -> READY. 422 without leads + schedule. */
  markReady(campaignId, options) {
    return http.post(`/campaigns/${campaignId}/ready`, undefined, options);
  },

  /**
   * READY -> SCHEDULED. All fields optional.
   * @param {{ timezone?: string, businessHoursStart?: string, businessHoursEnd?: string,
   *   workDays?: number[], dailyCallLimit?: number, hourlyCallLimit?: number,
   *   concurrencyLimit?: number, callbackWindowMinutes?: number,
   *   scheduledStartAt?: string, scheduledEndAt?: string }} payload
   */
  configureSchedule(campaignId, payload, options) {
    return http.post(`/campaigns/${campaignId}/schedule`, payload, options);
  },

  /** SCHEDULED -> RUNNING (OWNER, ADMIN). */
  start(campaignId, options) {
    return http.post(`/campaigns/${campaignId}/start`, undefined, options);
  },

  /** RUNNING -> PAUSED (OWNER, ADMIN). */
  pause(campaignId, options) {
    return http.post(`/campaigns/${campaignId}/pause`, undefined, options);
  },

  /** PAUSED -> RUNNING (OWNER, ADMIN). */
  resume(campaignId, options) {
    return http.post(`/campaigns/${campaignId}/resume`, undefined, options);
  },

  /** -> ARCHIVED. 409 from RUNNING (OWNER, ADMIN). */
  archive(campaignId, options) {
    return http.post(`/campaigns/${campaignId}/archive`, undefined, options);
  },

  /** Create a new DRAFT copy. @param {{ name: string, includeLeads?: boolean }} payload */
  clone(campaignId, payload, options) {
    return http.post(`/campaigns/${campaignId}/clone`, payload, options);
  },

  /**
   * Assign leads (OWNER, ADMIN). Already-assigned ids are skipped.
   * 409 if ARCHIVED, 422 if a lead id is not in the org.
   * @param {string[]} leadIds
   */
  assignLeads(campaignId, leadIds, options) {
    return http.post(`/campaigns/${campaignId}/leads`, { leadIds }, options);
  },

  /** @param {{ status?: string, page?: number, limit?: number }} [params] */
  listLeads(campaignId, params, options) {
    return http.get(`/campaigns/${campaignId}/leads`, { ...options, query: params });
  },

  /** Remove one CampaignLead by its id (OWNER, ADMIN). 204. */
  removeLead(campaignId, campaignLeadId, options) {
    return http.delete(`/campaigns/${campaignId}/leads/${campaignLeadId}`, options);
  },

  /** Only DRAFT or ARCHIVED (409 otherwise). Soft delete, 204 (OWNER, ADMIN). */
  remove(campaignId, options) {
    return http.delete(`/campaigns/${campaignId}`, options);
  },

  // ---- Campaign analytics ---------------------------------------------------

  /** Raw counters. Auto-materializes a zeroed row if none exists. */
  metrics(campaignId, options) {
    return http.get(`/campaigns/${campaignId}/metrics`, options);
  },

  /** Derived rates (connect/answer/meeting/conversion/retry/success). Cached. */
  analytics(campaignId, options) {
    return http.get(`/campaigns/${campaignId}/analytics`, options);
  },

  /** @param {{ page?: number, limit?: number, level?: 'INFO'|'WARN'|'ERROR' }} [params] */
  logs(campaignId, params, options) {
    return http.get(`/campaigns/${campaignId}/logs`, { ...options, query: params });
  },

  /** @param {{ page?: number, limit?: number, type?: string }} [params] */
  history(campaignId, params, options) {
    return http.get(`/campaigns/${campaignId}/history`, { ...options, query: params });
  },

  /** Same handler/shape as {@link history}. */
  events(campaignId, params, options) {
    return http.get(`/campaigns/${campaignId}/events`, { ...options, query: params });
  },

  // ---- Retry rules --------------------------------------------------------

  /** Not paginated. 404 if campaign missing/cross-tenant. */
  listRetryRules(campaignId, options) {
    return http.get(`/campaigns/${campaignId}/retry-rules`, options);
  },

  /**
   * Upsert a retry rule (unique on campaignId + reason). OWNER, ADMIN.
   * reason: BUSY | NO_ANSWER | PROVIDER_TIMEOUT | NETWORK_FAILURE | REJECTED | FAILED_AI_CALL
   * backoffType: FIXED | EXPONENTIAL
   * @param {{ reason: string, maxAttempts?: number, backoffType?: string,
   *   baseDelayMinutes?: number, maxDelayMinutes?: number,
   *   retryWindowStart?: string, retryWindowEnd?: string, isActive?: boolean }} payload
   */
  upsertRetryRule(campaignId, payload, options) {
    return http.put(`/campaigns/${campaignId}/retry-rules`, payload, options);
  },

  /** Delete a retry rule by its CallFailureReason. 400 on a bad enum. 204. */
  deleteRetryRule(campaignId, reason, options) {
    return http.delete(`/campaigns/${campaignId}/retry-rules/${reason}`, options);
  },
};
