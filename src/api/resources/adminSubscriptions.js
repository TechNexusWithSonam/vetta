/** Admin — Subscriptions `/admin/subscriptions/*` (proposed contract). */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import {
  mockListSubscriptions, mockGetSubscription, mockChangeSubscriptionPlan, mockCancelSubscription,
} from '../../admin/mocks/subscriptions.mock.js';

export const adminSubscriptions = {
  list: withMockFallback(
    (params) => http.get('/admin/subscriptions', { query: params }),
    (params) => mockListSubscriptions(params),
  ),
  get: withMockFallback(
    (id) => http.get(`/admin/subscriptions/${id}`),
    (id) => mockGetSubscription(id),
  ),
  changePlan: withMockFallback(
    (id, payload) => http.patch(`/admin/subscriptions/${id}/plan`, payload),
    (id, payload) => mockChangeSubscriptionPlan(id, payload.planId),
  ),
  cancel: withMockFallback(
    (id, payload) => http.post(`/admin/subscriptions/${id}/cancel`, payload),
    (id) => mockCancelSubscription(id),
  ),
};

export default adminSubscriptions;
