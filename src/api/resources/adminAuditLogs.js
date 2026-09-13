/**
 * Admin — Audit Logs `/admin/audit-logs/*` (proposed contract).
 * `create()`'s mock path is stateful (session-persisted) so every other
 * admin mutation's audit entry actually shows up in the Audit Logs page
 * during a demo session, not just static seed data.
 */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import { mockListAuditLogs, mockCreateAuditLog } from '../../admin/mocks/auditLogs.mock.js';

export const adminAuditLogs = {
  list: withMockFallback(
    (params) => http.get('/admin/audit-logs', { query: params }),
    (params) => mockListAuditLogs(params),
  ),
  create: withMockFallback(
    (entry) => http.post('/admin/audit-logs', entry),
    (entry) => mockCreateAuditLog(entry),
  ),
};

export default adminAuditLogs;
