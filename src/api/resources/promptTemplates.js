/**
 * Prompt Templates — `/prompt-templates/*`
 *
 * `key` must match `/^[a-z][a-z0-9_]*$/` and is unique + immutable. Creating a
 * version auto-increments `version` (max + 1) and deactivates all prior
 * versions. Mutations require OWNER or ADMIN. Lists are not paginated.
 */

import { http } from '../client.js';

export const promptTemplates = {
  /** Plain array ordered by key. */
  list(options) {
    return http.get('/prompt-templates', options);
  },

  /** @param {{ key: string, description?: string }} payload */
  create(payload, options) {
    return http.post('/prompt-templates', payload, options);
  },

  /** Only `description` is editable. @param {{ description: string }} payload */
  update(promptTemplateId, payload, options) {
    return http.put(`/prompt-templates/${promptTemplateId}`, payload, options);
  },

  /** @param {{ content: string }} payload */
  createVersion(promptTemplateId, payload, options) {
    return http.post(`/prompt-templates/${promptTemplateId}/version`, payload, options);
  },

  /** Ordered by version desc. Not paginated. */
  listVersions(promptTemplateId, options) {
    return http.get(`/prompt-templates/${promptTemplateId}/versions`, options);
  },
};
