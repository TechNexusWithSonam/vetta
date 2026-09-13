/** Admin — Roles & Permissions `/admin/roles/*` (proposed contract). */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import {
  mockListRoles, mockListPermissions, mockUpdateRolePermissions,
} from '../../admin/mocks/roles.mock.js';

export const adminRoles = {
  listRoles: withMockFallback(
    () => http.get('/admin/roles'),
    () => mockListRoles(),
  ),
  listPermissions: withMockFallback(
    () => http.get('/admin/permissions'),
    () => mockListPermissions(),
  ),
  updateRolePermissions: withMockFallback(
    (roleId, payload) => http.patch(`/admin/roles/${roleId}/permissions`, payload),
    (roleId, payload) => mockUpdateRolePermissions(roleId, payload),
  ),
};

export default adminRoles;
