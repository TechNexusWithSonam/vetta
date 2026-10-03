/**
 * Platform permission keys — mirror of the backend catalog
 * (vetta-backend `src/modules/platform-admin/lib/platform-permissions.ts`),
 * used only to decide what the UI shows. Enforcement is server-side; the
 * labelled catalog for the Roles & Permissions matrix is fetched from
 * `GET /admin/permissions`, not hardcoded here.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  ORGANIZATIONS_VIEW: 'organizations.view',
  ORGANIZATIONS_MANAGE: 'organizations.manage',
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',
  CALLS_VIEW: 'calls.view',
  SUBSCRIPTIONS_VIEW: 'subscriptions.view',
  SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',
  PLANS_VIEW: 'plans.view',
  PLANS_MANAGE: 'plans.manage',
  BILLING_VIEW: 'billing.view',
  BILLING_MANAGE: 'billing.manage',
  USAGE_VIEW: 'usage.view',
  USAGE_MANAGE: 'usage.manage',
  COGS_VIEW: 'cogs.view',
  COGS_MANAGE: 'cogs.manage',
  ANALYTICS_VIEW: 'analytics.view',
  ROLES_VIEW: 'roles.view',
  ROLES_MANAGE: 'roles.manage',
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  AUDIT_LOGS_VIEW: 'audit_logs.view',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
};
