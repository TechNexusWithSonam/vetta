/**
 * Analytics — `/analytics/*` (dashboards, events, exports, funnel, reports)
 *
 * Date params (`from`/`to`) are `YYYY-MM-DD` and default to a trailing 30-day
 * window. `downloadExport` streams a raw file rather than the JSON envelope.
 * Most routes are OWNER/ADMIN only.
 */

import { http } from '../client.js';

const dateParams = (params) => ({ query: params });

export const analytics = {
  dashboard: {
    /** `campaignId` is accepted but ignored (org-wide only). */
    executive(params, options) {
      return http.get('/analytics/dashboard/executive', { ...options, ...dateParams(params) });
    },
    /** Auto-materializes a zeroed CampaignMetric row if none exists. */
    campaign(campaignId, options) {
      return http.get(`/analytics/dashboard/campaign/${campaignId}`, options);
    },
    /** @param {string} agentId A User id. */
    agent(agentId, params, options) {
      return http.get(`/analytics/dashboard/agent/${agentId}`, { ...options, ...dateParams(params) });
    },
    voice(params, options) {
      return http.get('/analytics/dashboard/voice', { ...options, ...dateParams(params) });
    },
    ai(params, options) {
      return http.get('/analytics/dashboard/ai', { ...options, ...dateParams(params) });
    },
    /** @param {{ connectionId?: string }} [params] */
    crm(params, options) {
      return http.get('/analytics/dashboard/crm', { ...options, query: params });
    },
    /** Live BullMQ queue depth across every registered queue. */
    systemHealth(options) {
      return http.get('/analytics/dashboard/system-health', options);
    },
  },

  /**
   * Raw activity feed (OWNER, ADMIN).
   * @param {{ eventType?: string, campaignId?: string, from?: string, to?: string, page?: number, limit?: number }} [params]
   */
  events(params, options) {
    return http.get('/analytics/events', { ...options, query: params });
  },

  exports: {
    /**
     * Enqueue an async export; returns immediately with status PENDING.
     * type: DAILY | WEEKLY | MONTHLY | CAMPAIGN | AGENT | TENANT_USAGE.
     * format: CSV | PDF. OWNER, ADMIN.
     * @param {{ type: string, format: string, filters?: object }} payload
     */
    request(payload, options) {
      return http.post('/analytics/exports', payload, options);
    },

    /** status: PENDING -> PROCESSING -> COMPLETED/FAILED. OWNER, ADMIN. */
    status(analyticsExportId, options) {
      return http.get(`/analytics/exports/${analyticsExportId}`, options);
    },

    /**
     * Download the finished file as a `Blob` (text/csv or application/pdf).
     * 400 if the export is not yet COMPLETED. OWNER, ADMIN.
     * @returns {Promise<Blob>}
     */
    async download(analyticsExportId, options) {
      const res = await http.get(`/analytics/exports/${analyticsExportId}/download`, {
        ...options,
        raw: true,
      });
      return res.blob();
    },
  },

  /**
   * 8-stage conversion funnel: Imported -> Researched -> Assigned -> Called ->
   * Connected -> Qualified -> Meeting Booked -> Won.
   * @param {{ from?: string, to?: string, timezone?: string, campaignId?: string }} [params]
   */
  funnel(params, options) {
    return http.get('/analytics/funnel', { ...options, query: params });
  },

  reports: {
    /** @param {{ from?: string, to?: string, timezone?: string }} [params] */
    daily(params, options) {
      return http.get('/analytics/reports/daily', { ...options, query: params });
    },
    weekly(params, options) {
      return http.get('/analytics/reports/weekly', { ...options, query: params });
    },
    monthly(params, options) {
      return http.get('/analytics/reports/monthly', { ...options, query: params });
    },
    campaign(campaignId, params, options) {
      return http.get(`/analytics/reports/campaign/${campaignId}`, { ...options, query: params });
    },
    /** @param {string} agentId A User id. */
    agent(agentId, params, options) {
      return http.get(`/analytics/reports/agent/${agentId}`, { ...options, query: params });
    },
    tenant(params, options) {
      return http.get('/analytics/reports/tenant', { ...options, query: params });
    },
  },
};
