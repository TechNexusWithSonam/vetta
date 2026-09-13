/** Admin — Users `/admin/users/*` (proposed contract). See adminOrganizations.js for the fallback pattern. */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import { mockListUsers, mockGetUser, mockMutateUser } from '../../admin/mocks/users.mock.js';

export const adminUsers = {
  list: withMockFallback(
    (params) => http.get('/admin/users', { query: params }),
    (params) => mockListUsers(params),
  ),
  get: withMockFallback(
    (id) => http.get(`/admin/users/${id}`),
    (id) => mockGetUser(id),
  ),
  updateRole: withMockFallback(
    (id, payload) => http.patch(`/admin/users/${id}/role`, payload),
    (id, payload) => mockMutateUser(id, { role: payload.role }),
  ),
  suspend: withMockFallback(
    (id, payload) => http.post(`/admin/users/${id}/suspend`, payload),
    (id) => mockMutateUser(id, { status: 'suspended' }),
  ),
  activate: withMockFallback(
    (id) => http.post(`/admin/users/${id}/activate`),
    (id) => mockMutateUser(id, { status: 'active' }),
  ),
};

export default adminUsers;
