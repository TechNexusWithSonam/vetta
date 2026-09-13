/** Admin — Calls `/admin/calls/*` (proposed contract), platform-wide (cross-tenant). */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import { mockListCalls, mockGetCall } from '../../admin/mocks/calls.mock.js';

export const adminCalls = {
  list: withMockFallback(
    (params) => http.get('/admin/calls', { query: params }),
    (params) => mockListCalls(params),
  ),
  get: withMockFallback(
    (id) => http.get(`/admin/calls/${id}`),
    (id) => mockGetCall(id),
  ),
};

export default adminCalls;
