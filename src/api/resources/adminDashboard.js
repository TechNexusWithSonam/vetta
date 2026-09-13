/** Admin — Dashboard summary `/admin/dashboard/*` (proposed contract). */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import { mockDashboardSummary } from '../../admin/mocks/dashboard.mock.js';

export const adminDashboard = {
  summary: withMockFallback(
    (params) => http.get('/admin/dashboard/summary', { query: params }),
    (params) => mockDashboardSummary(params),
  ),
};

export default adminDashboard;
