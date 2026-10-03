/**
 * Objections — `/objections/*`
 *
 * `list` returns one entry per ObjectionType (8 total), merging org overrides
 * with built-in defaults (`isCustom` flags an override). Creating an override
 * 409s if one already exists for that type (use {@link update}). `type` is
 * immutable. Mutations require OWNER or ADMIN. Delete is a soft delete that
 * falls back to the built-in default.
 *
 * type: NOT_INTERESTED | ALREADY_USING_COMPETITOR | NO_BUDGET | SEND_EMAIL |
 *       BUSY_NOW | NEED_MANAGER_APPROVAL | CALL_LATER | WRONG_CONTACT
 */

import { http } from '../client.js';

export const objections = {
  /** Effective objections (overrides + defaults). Not paginated. */
  list(options) {
    return http.get('/objections', options);
  },

  /**
   * @param {{ type: string, intent?: string, recommendedResponse?: string,
   *   followUpQuestion?: string, exitCondition?: string, isActive?: boolean }} payload
   */
  create(payload, options) {
    return http.post('/objections', payload, options);
  },

  /** @param {object} payload Any override field except `type`. */
  update(objectionId, payload, options) {
    return http.patch(`/objections/${objectionId}`, payload, options);
  },

  /** Soft delete, 204. Reverts to the built-in default for the type. */
  remove(objectionId, options) {
    return http.delete(`/objections/${objectionId}`, options);
  },
};
