/**
 * Platform-level permission strings for the Super Admin panel. These are
 * intentionally granular (resource.action) so new capabilities can be added
 * without reshaping the model — see ROLE_PERMISSIONS in `roles.js`.
 */
export const PERMISSIONS = {
  ORGANIZATIONS_VIEW: 'organizations.view',
  ORGANIZATIONS_CREATE: 'organizations.create',
  ORGANIZATIONS_EDIT: 'organizations.edit',
  ORGANIZATIONS_DELETE: 'organizations.delete',
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',
  CALLS_VIEW: 'calls.view',
  BILLING_VIEW: 'billing.view',
  BILLING_MANAGE: 'billing.manage',
  PLANS_VIEW: 'plans.view',
  PLANS_MANAGE: 'plans.manage',
  ANALYTICS_VIEW: 'analytics.view',
  COGS_VIEW: 'cogs.view',
  COGS_MANAGE: 'cogs.manage',
  SETTINGS_MANAGE: 'settings.manage',
  AUDIT_LOGS_VIEW: 'audit_logs.view',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  ROLES_MANAGE: 'roles.manage',
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/** Human labels + grouping, for the Roles & Permissions matrix UI. */
export const PERMISSION_CATALOG = [
  { category: 'Organizations', keys: [PERMISSIONS.ORGANIZATIONS_VIEW, PERMISSIONS.ORGANIZATIONS_CREATE, PERMISSIONS.ORGANIZATIONS_EDIT, PERMISSIONS.ORGANIZATIONS_DELETE] },
  { category: 'Users', keys: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE] },
  { category: 'Calls', keys: [PERMISSIONS.CALLS_VIEW] },
  { category: 'Billing', keys: [PERMISSIONS.BILLING_VIEW, PERMISSIONS.BILLING_MANAGE] },
  { category: 'Plans', keys: [PERMISSIONS.PLANS_VIEW, PERMISSIONS.PLANS_MANAGE] },
  { category: 'Analytics', keys: [PERMISSIONS.ANALYTICS_VIEW] },
  { category: 'COGS', keys: [PERMISSIONS.COGS_VIEW, PERMISSIONS.COGS_MANAGE] },
  { category: 'Settings', keys: [PERMISSIONS.SETTINGS_MANAGE] },
  { category: 'Audit Logs', keys: [PERMISSIONS.AUDIT_LOGS_VIEW] },
  { category: 'Notifications', keys: [PERMISSIONS.NOTIFICATIONS_MANAGE] },
  { category: 'Roles', keys: [PERMISSIONS.ROLES_MANAGE] },
];

const LABELS = {
  [PERMISSIONS.ORGANIZATIONS_VIEW]: 'View organizations',
  [PERMISSIONS.ORGANIZATIONS_CREATE]: 'Create organizations',
  [PERMISSIONS.ORGANIZATIONS_EDIT]: 'Edit organizations',
  [PERMISSIONS.ORGANIZATIONS_DELETE]: 'Delete organizations',
  [PERMISSIONS.USERS_VIEW]: 'View users',
  [PERMISSIONS.USERS_MANAGE]: 'Manage users',
  [PERMISSIONS.CALLS_VIEW]: 'View calls',
  [PERMISSIONS.BILLING_VIEW]: 'View billing',
  [PERMISSIONS.BILLING_MANAGE]: 'Manage billing',
  [PERMISSIONS.PLANS_VIEW]: 'View plans',
  [PERMISSIONS.PLANS_MANAGE]: 'Manage plans',
  [PERMISSIONS.ANALYTICS_VIEW]: 'View analytics',
  [PERMISSIONS.COGS_VIEW]: 'View COGS',
  [PERMISSIONS.COGS_MANAGE]: 'Manage COGS',
  [PERMISSIONS.SETTINGS_MANAGE]: 'Manage system settings',
  [PERMISSIONS.AUDIT_LOGS_VIEW]: 'View audit logs',
  [PERMISSIONS.NOTIFICATIONS_MANAGE]: 'Manage notifications',
  [PERMISSIONS.ROLES_MANAGE]: 'Manage roles & permissions',
};

export function permissionLabel(key) {
  return LABELS[key] || key;
}
