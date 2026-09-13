/**
 * Admin — Organizations `/admin/organizations/*` (proposed contract).
 *
 * Real-call-with-mock-fallback: every function attempts the literal
 * `/admin/...` path first; a 404/405/501/502/503 (backend hasn't shipped this
 * route yet) falls back to deterministic mock data. See
 * `src/admin/lib/mockFallback.js` for the mechanism and BACKEND_ISSUES.md for
 * the backend requirement this is written against.
 *
 * There is deliberately no `loginAs()` here — impersonation is out of scope
 * until the backend supports a secure token-exchange flow.
 */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import {
  mockListOrganizations, mockGetOrganization, mockMutateOrganization,
  mockCreateOrganization, mockRemoveOrganization,
} from '../../admin/mocks/organizations.mock.js';
import { mockUsersOfOrganization } from '../../admin/mocks/users.mock.js';
import { mockCallsOfOrganization } from '../../admin/mocks/calls.mock.js';
import { mockUsageOfOrganization } from '../../admin/mocks/usage.mock.js';
import { mockSubscriptionOfOrganization } from '../../admin/mocks/subscriptions.mock.js';
import { mockBillingOfOrganization } from '../../admin/mocks/billing.mock.js';
import { mockListAuditLogs } from '../../admin/mocks/auditLogs.mock.js';

export const adminOrganizations = {
  list: withMockFallback(
    (params) => http.get('/admin/organizations', { query: params }),
    (params) => mockListOrganizations(params),
  ),
  get: withMockFallback(
    (id) => http.get(`/admin/organizations/${id}`),
    (id) => mockGetOrganization(id),
  ),
  usersOf: withMockFallback(
    (id, params) => http.get(`/admin/organizations/${id}/users`, { query: params }),
    (id, params) => mockUsersOfOrganization(id, params),
  ),
  callsOf: withMockFallback(
    (id, params) => http.get(`/admin/organizations/${id}/calls`, { query: params }),
    (id, params) => mockCallsOfOrganization(id, params),
  ),
  usageOf: withMockFallback(
    (id, params) => http.get(`/admin/organizations/${id}/usage`, { query: params }),
    (id) => mockUsageOfOrganization(id),
  ),
  subscriptionOf: withMockFallback(
    (id) => http.get(`/admin/organizations/${id}/subscription`),
    (id) => mockSubscriptionOfOrganization(id),
  ),
  billingOf: withMockFallback(
    (id, params) => http.get(`/admin/organizations/${id}/billing`, { query: params }),
    (id, params) => mockBillingOfOrganization(id, params),
  ),
  activityOf: withMockFallback(
    (id, params) => http.get(`/admin/organizations/${id}/activity`, { query: params }),
    (id, params) => mockListAuditLogs({ ...params, organizationId: id }),
  ),
  create: withMockFallback(
    (payload) => http.post('/admin/organizations', payload),
    (payload) => mockCreateOrganization(payload),
  ),
  update: withMockFallback(
    (id, payload) => http.patch(`/admin/organizations/${id}`, payload),
    (id, payload) => mockMutateOrganization(id, payload),
  ),
  suspend: withMockFallback(
    (id, payload) => http.post(`/admin/organizations/${id}/suspend`, payload),
    (id) => mockMutateOrganization(id, { status: 'suspended', subscriptionStatus: 'PAST_DUE' }),
  ),
  activate: withMockFallback(
    (id) => http.post(`/admin/organizations/${id}/activate`),
    (id) => mockMutateOrganization(id, { status: 'active', subscriptionStatus: 'ACTIVE' }),
  ),
  remove: withMockFallback(
    (id) => http.delete(`/admin/organizations/${id}`),
    (id) => mockRemoveOrganization(id),
  ),
};

export default adminOrganizations;
