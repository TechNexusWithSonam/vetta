/**
 * Campaign Templates — `/campaign-templates/*`
 *
 * `scriptPromptKey` should reference an existing PromptTemplate.key.
 * `defaultScheduleConfig` seeds a campaign's schedule when the template is used.
 * Mutations require OWNER or ADMIN. Delete is a soft delete (204).
 */

import { http } from '../client.js';

export const campaignTemplates = {
  /**
   * @param {{ name: string, description?: string, scriptPromptKey?: string,
   *   defaultScheduleConfig?: object }} payload
   * Note: the current deployment rejects a bare `{ name }` — supply
   * `scriptPromptKey` (an existing PromptTemplate.key) and
   * `defaultScheduleConfig` too.
   */
  create(payload, options) {
    return http.post('/campaign-templates', payload, options);
  },

  /** @param {{ page?: number, limit?: number }} [params] */
  list(params, options) {
    return http.get('/campaign-templates', { ...options, query: params });
  },

  /** 404 "Campaign template not found" if missing/cross-tenant. */
  get(campaignTemplateId, options) {
    return http.get(`/campaign-templates/${campaignTemplateId}`, options);
  },

  /** @param {{ name?: string, description?: string, scriptPromptKey?: string, isActive?: boolean, defaultScheduleConfig?: object }} payload */
  update(campaignTemplateId, payload, options) {
    return http.patch(`/campaign-templates/${campaignTemplateId}`, payload, options);
  },

  /** Soft delete, 204. */
  remove(campaignTemplateId, options) {
    return http.delete(`/campaign-templates/${campaignTemplateId}`, options);
  },
};
