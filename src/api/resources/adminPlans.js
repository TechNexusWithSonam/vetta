/** Admin — Plans & Pricing `/admin/plans/*` (proposed contract). */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import {
  mockListPlans, mockGetPlan, mockCreatePlan, mockUpdatePlan, mockSetPlanActive,
} from '../../admin/mocks/plans.mock.js';

export const adminPlans = {
  list: withMockFallback(
    () => http.get('/admin/plans'),
    () => mockListPlans(),
  ),
  get: withMockFallback(
    (id) => http.get(`/admin/plans/${id}`),
    (id) => mockGetPlan(id),
  ),
  create: withMockFallback(
    (payload) => http.post('/admin/plans', payload),
    (payload) => mockCreatePlan(payload),
  ),
  update: withMockFallback(
    (id, payload) => http.patch(`/admin/plans/${id}`, payload),
    (id, payload) => mockUpdatePlan(id, payload),
  ),
  archive: withMockFallback(
    (id) => http.post(`/admin/plans/${id}/archive`),
    (id) => mockSetPlanActive(id, false),
  ),
  activate: withMockFallback(
    (id) => http.post(`/admin/plans/${id}/activate`),
    (id) => mockSetPlanActive(id, true),
  ),
};

export default adminPlans;
