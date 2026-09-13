/** Admin — platform-wide Analytics `/admin/analytics/*` (proposed contract), distinct from the org-scoped api.analytics. */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import {
  mockPlatformOverview, mockOrgGrowth, mockRevenueTrend, mockChurnTrend, mockCallVolumeTrend, mockPlanDistribution,
} from '../../admin/mocks/analytics.mock.js';

export const adminAnalytics = {
  platformOverview: withMockFallback(
    (params) => http.get('/admin/analytics/overview', { query: params }),
    (params) => mockPlatformOverview(params),
  ),
  orgGrowth: withMockFallback(
    (params) => http.get('/admin/analytics/org-growth', { query: params }),
    (params) => mockOrgGrowth(params),
  ),
  revenueTrend: withMockFallback(
    (params) => http.get('/admin/analytics/revenue-trend', { query: params }),
    (params) => mockRevenueTrend(params),
  ),
  churnTrend: withMockFallback(
    (params) => http.get('/admin/analytics/churn-trend', { query: params }),
    () => mockChurnTrend(),
  ),
  callVolumeTrend: withMockFallback(
    (params) => http.get('/admin/analytics/call-volume-trend', { query: params }),
    () => mockCallVolumeTrend(),
  ),
  planDistribution: withMockFallback(
    () => http.get('/admin/analytics/plan-distribution'),
    () => mockPlanDistribution(),
  ),
};

export default adminAnalytics;
