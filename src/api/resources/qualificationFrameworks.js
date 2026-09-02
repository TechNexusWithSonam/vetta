/**
 * Qualification Frameworks — `/qualification-frameworks/*`
 *
 * type: BANT | MEDDICC | SPIN | CUSTOM. `config` is optional for the first three
 * (a built-in default is used) but REQUIRED for CUSTOM (422 otherwise). `type`
 * is immutable after creation. Mutations require OWNER or ADMIN. Delete is a
 * soft delete (204).
 */

import { http } from '../client.js';

export const qualificationFrameworks = {
  /** @param {{ name: string, type: string, config?: object, isActive?: boolean }} payload */
  create(payload, options) {
    return http.post('/qualification-frameworks', payload, options);
  },

  /** @param {{ page?: number, limit?: number }} [params] */
  list(params, options) {
    return http.get('/qualification-frameworks', { ...options, query: params });
  },

  /** 404 if missing/cross-tenant. */
  get(qualificationFrameworkId, options) {
    return http.get(`/qualification-frameworks/${qualificationFrameworkId}`, options);
  },

  /** @param {{ name?: string, config?: object, isActive?: boolean }} payload (type is immutable). */
  update(qualificationFrameworkId, payload, options) {
    return http.patch(`/qualification-frameworks/${qualificationFrameworkId}`, payload, options);
  },

  /** Soft delete, 204. */
  remove(qualificationFrameworkId, options) {
    return http.delete(`/qualification-frameworks/${qualificationFrameworkId}`, options);
  },
};
