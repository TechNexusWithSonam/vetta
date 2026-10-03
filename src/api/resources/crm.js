/**
 * CRM — `/crm/*` (connections, sync jobs, webhooks, ledgers, field mappings)
 *
 * provider: HUBSPOT | AIRTABLE | SALESFORCE | PIPEDRIVE | ZOHO_CRM — only
 * HUBSPOT and AIRTABLE have adapters (400 for the rest). Creating/updating a
 * connection with credentials immediately live-tests it. Responses never echo
 * the stored credential. Activities/deals/companies/contacts are read-only
 * ledgers populated by internal listeners. Mutations require OWNER or ADMIN.
 */

import { http } from '../client.js';

export const crm = {
  connections: {
    /** @param {{ provider: string, credentials: object, config?: object }} payload */
    create(payload, options) {
      return http.post('/crm/connections', payload, options);
    },

    list(options) {
      return http.get('/crm/connections', options);
    },

    /** 404 if missing/soft-deleted/cross-tenant. */
    get(crmConnectionId, options) {
      return http.get(`/crm/connections/${crmConnectionId}`, options);
    },

    /** Live provider call; records status ERROR on failure but still 2xx. */
    test(crmConnectionId, options) {
      return http.post(`/crm/connections/${crmConnectionId}/test`, undefined, options);
    },

    /** @param {{ credentials?: object, config?: object }} payload (credentials replace + re-test). */
    update(crmConnectionId, payload, options) {
      return http.patch(`/crm/connections/${crmConnectionId}`, payload, options);
    },

    /** status = ACTIVE (no live test). */
    enable(crmConnectionId, options) {
      return http.post(`/crm/connections/${crmConnectionId}/enable`, undefined, options);
    },

    /** status = DISABLED. */
    disable(crmConnectionId, options) {
      return http.post(`/crm/connections/${crmConnectionId}/disable`, undefined, options);
    },

    /** Soft delete (status = DISCONNECTED). 204. */
    remove(crmConnectionId, options) {
      return http.delete(`/crm/connections/${crmConnectionId}`, options);
    },
  },

  sync: {
    /** @param {{ connectionId?: string }} [params] */
    stats(params, options) {
      return http.get('/crm/sync/stats', { ...options, query: params });
    },

    /** Plain array (no pagination envelope). @param {{ status?: string, connectionId?: string, page?: number, limit?: number }} [params] */
    listJobs(params, options) {
      return http.get('/crm/sync/jobs', { ...options, query: params });
    },

    /** 404 "CRM sync job not found" if missing/cross-tenant. */
    getJob(crmSyncJobId, options) {
      return http.get(`/crm/sync/jobs/${crmSyncJobId}`, options);
    },

    /** 400 unless status is FAILED or DEAD_LETTER, or if the connection is not ACTIVE. */
    retryJob(crmSyncJobId, options) {
      return http.post(`/crm/sync/jobs/${crmSyncJobId}/retry`, undefined, options);
    },
  },

  /** @param {{ connectionId?: string }} [params] — all read-only. */
  activities(params, options) {
    return http.get('/crm/activities', { ...options, query: params });
  },
  deals(params, options) {
    return http.get('/crm/deals', { ...options, query: params });
  },
  companies(params, options) {
    return http.get('/crm/companies', { ...options, query: params });
  },
  contacts(params, options) {
    return http.get('/crm/contacts', { ...options, query: params });
  },

  mappings: {
    /**
     * entityType: CONTACT | COMPANY | DEAL | ACTIVITY. OWNER, ADMIN.
     * @param {{ connectionId: string, entityType: string, platformField: string,
     *   crmField: string, isCustomField?: boolean }} payload
     */
    create(payload, options) {
      return http.post('/crm/mappings', payload, options);
    },

    /** @param {{ connectionId?: string }} [params] */
    list(params, options) {
      return http.get('/crm/mappings', { ...options, query: params });
    },

    /** @param {{ crmField?: string, isCustomField?: boolean }} payload (key fields immutable). */
    update(crmMappingId, payload, options) {
      return http.patch(`/crm/mappings/${crmMappingId}`, payload, options);
    },

    /** Hard delete. 204. */
    remove(crmMappingId, options) {
      return http.delete(`/crm/mappings/${crmMappingId}`, options);
    },
  },

  /** Provider webhooks (`@Public()`, signature-verified server-side). */
  webhooks: {
    hubspot(payload, options) {
      return http.post('/crm/webhooks/hubspot', payload, { ...options, auth: false });
    },
    airtable(payload, options) {
      return http.post('/crm/webhooks/airtable', payload, { ...options, auth: false });
    },
  },
};
