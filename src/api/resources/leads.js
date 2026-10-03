/**
 * Leads — `/leads/*`
 *
 * status: NEW | CONTACTED | QUALIFIED | UNQUALIFIED | CONVERTED | ARCHIVED
 * source: MANUAL | CSV_IMPORT | API | LINKEDIN | WEBSITE | REFERRAL | OTHER
 * note type: NOTE | CALL | EMAIL | MEETING (default NOTE)
 */

import { http } from '../client.js';

export const leads = {
  /**
   * @param {object} payload CreateLeadDto — `email` required; `firstName`,
   *   `lastName`, `company`, `title`, `phone`, `linkedinUrl`, `status`,
   *   `source`, `tags` (string[]), `customFields` (object) optional.
   */
  create(payload, options) {
    return http.post('/leads', payload, options);
  },

  /**
   * Paginated + cached.
   * @param {{ page?: number, limit?: number, status?: string, source?: string,
   *   assignedToId?: string, search?: string, tags?: string|string[],
   *   createdAfter?: string, createdBefore?: string }} [params]
   */
  list(params, options) {
    return http.get('/leads', { ...options, query: params });
  },

  /** Totals grouped by status/source. */
  analytics(options) {
    return http.get('/leads/analytics', options);
  },

  /** 404 if missing / cross-tenant. */
  get(leadId, options) {
    return http.get(`/leads/${leadId}`, options);
  },

  /** PartialType(CreateLeadDto) — all fields optional. 409 on email collision. */
  update(leadId, payload, options) {
    return http.patch(`/leads/${leadId}`, payload, options);
  },

  /** @param {string} status New LeadStatus. No-op if unchanged. */
  updateStatus(leadId, status, options) {
    return http.patch(`/leads/${leadId}/status`, { status }, options);
  },

  /**
   * Assign / unassign a lead (OWNER, ADMIN). Pass `null` to unassign.
   * 422 if the user is not an active member of the org.
   * @param {string|null} assignedToId
   */
  assign(leadId, assignedToId, options) {
    return http.patch(`/leads/${leadId}/assign`, { assignedToId }, options);
  },

  /** @param {{ content: string, type?: 'NOTE'|'CALL'|'EMAIL'|'MEETING' }} payload */
  addNote(leadId, payload, options) {
    return http.post(`/leads/${leadId}/notes`, payload, options);
  },

  /** @param {{ page?: number, limit?: number }} [params] */
  listNotes(leadId, params, options) {
    return http.get(`/leads/${leadId}/notes`, { ...options, query: params });
  },

  /** Merged notes + audit log, newest first. Not paginated. */
  timeline(leadId, options) {
    return http.get(`/leads/${leadId}/timeline`, options);
  },

  /** Soft delete, 204 (OWNER, ADMIN). */
  remove(leadId, options) {
    return http.delete(`/leads/${leadId}`, options);
  },
};
