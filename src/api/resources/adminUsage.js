/** Admin — Usage & Credits `/admin/usage/*` (proposed contract). */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import { mockUsageOverview, mockListUsage, mockAdjustCredits } from '../../admin/mocks/usage.mock.js';

export const adminUsage = {
  overview: withMockFallback(
    (params) => http.get('/admin/usage/overview', { query: params }),
    () => mockUsageOverview(),
  ),
  list: withMockFallback(
    (params) => http.get('/admin/usage', { query: params }),
    (params) => mockListUsage(params),
  ),
  credits: {
    adjust: withMockFallback(
      (organizationId, payload) => http.post(`/admin/usage/${organizationId}/credits/adjust`, payload),
      (organizationId, payload) => mockAdjustCredits(organizationId, payload),
    ),
  },
};

export default adminUsage;
