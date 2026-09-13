/** Admin — COGS `/admin/cogs/*` (proposed contract). */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import { mockListCogsCategories, mockUpdateCogsCategory, mockCogsSummary } from '../../admin/mocks/cogs.mock.js';

export const adminCogs = {
  categories: {
    list: withMockFallback(
      () => http.get('/admin/cogs/categories'),
      () => mockListCogsCategories(),
    ),
    update: withMockFallback(
      (id, payload) => http.patch(`/admin/cogs/categories/${id}`, payload),
      (id, payload) => mockUpdateCogsCategory(id, payload),
    ),
  },
  summary: withMockFallback(
    (params) => http.get('/admin/cogs/summary', { query: params }),
    () => mockCogsSummary(),
  ),
};

export default adminCogs;
