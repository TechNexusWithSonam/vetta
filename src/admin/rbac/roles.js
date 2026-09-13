/**
 * Platform-level roles. `SUPER_ADMIN` is the only role that currently reaches
 * `/admin/*` (see `superAdminGate.js`). The other three document the existing
 * org-scoped concept (today's backend `OWNER`/`ADMIN`/member roles) so the
 * model is ready to support scoped admin roles later without reshaping —
 * they intentionally carry no platform permissions yet.
 */
import { ALL_PERMISSIONS } from './permissions.js';

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ORGANIZATION_ADMIN: 'ORGANIZATION_ADMIN', // alias of today's org-scoped OWNER
  MANAGER: 'MANAGER', // alias of today's org-scoped ADMIN
  USER: 'USER', // alias of a plain org member
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
  [ROLES.ORGANIZATION_ADMIN]: [],
  [ROLES.MANAGER]: [],
  [ROLES.USER]: [],
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ORGANIZATION_ADMIN]: 'Organization Admin',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.USER]: 'User',
};
