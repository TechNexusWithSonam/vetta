/**
 * Imports — `/imports/leads/*`
 *
 * `fileKey` is an S3 object key for an already-uploaded CSV (the backend has no
 * upload endpoint — upload out of band first). Creating an import enqueues an
 * async job. `list` returns a plain array (no pagination envelope).
 */

import { http } from '../client.js';

export const imports = {
  /**
   * @param {{ fileKey: string, mapping: Record<string, string> }} payload
   *   `mapping` maps CSV column headers -> lead field names.
   */
  createLeadImport(payload, options) {
    return http.post('/imports/leads', payload, options);
  },

  /** @param {{ page?: number, limit?: number }} [params] */
  listLeadImports(params, options) {
    return http.get('/imports/leads', { ...options, query: params });
  },

  /** 404 "Import job not found" if missing/cross-tenant. */
  getLeadImport(importId, options) {
    return http.get(`/imports/leads/${importId}`, options);
  },
};
