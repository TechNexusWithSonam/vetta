import { ROLES, ROLE_PERMISSIONS, ROLE_LABELS } from '../rbac/roles.js';
import { PERMISSION_CATALOG, permissionLabel } from '../rbac/permissions.js';

let ROLE_STATE = Object.fromEntries(
  Object.values(ROLES).map((r) => [r, { permissions: [...ROLE_PERMISSIONS[r]] }]),
);

export function mockListRoles() {
  return Object.values(ROLES).map((id) => ({
    id,
    name: ROLE_LABELS[id],
    description:
      id === ROLES.SUPER_ADMIN
        ? 'Full platform access. Not yet enforced server-side — see Roles & Permissions banner.'
        : 'Existing org-scoped role — does not reach the Super Admin panel.',
    isSystem: id === ROLES.SUPER_ADMIN,
    permissions: ROLE_STATE[id].permissions,
  }));
}

export function mockListPermissions() {
  return PERMISSION_CATALOG.flatMap((group) => group.keys.map((key) => ({ key, label: permissionLabel(key), category: group.category })));
}

export function mockUpdateRolePermissions(roleId, { permissions } = {}) {
  if (!ROLE_STATE[roleId]) throw new Error('Role not found');
  ROLE_STATE[roleId] = { permissions: permissions || [] };
  return { id: roleId, permissions: ROLE_STATE[roleId].permissions };
}
