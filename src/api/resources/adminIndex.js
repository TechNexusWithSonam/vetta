/**
 * Admin API — aggregates every `admin*.js` resource into one namespace,
 * consumed as `api.admin.organizations.list(...)`, etc. Mirrors the assembly
 * pattern in `src/api/index.js` for the other 17 namespaces.
 */
import { adminOrganizations as organizations } from './adminOrganizations.js';
import { adminUsers as users } from './adminUsers.js';
import { adminCalls as calls } from './adminCalls.js';
import { adminSubscriptions as subscriptions } from './adminSubscriptions.js';
import { adminPlans as plans } from './adminPlans.js';
import { adminBilling as billing } from './adminBilling.js';
import { adminUsage as usage } from './adminUsage.js';
import { adminCogs as cogs } from './adminCogs.js';
import { adminAnalytics as analytics } from './adminAnalytics.js';
import { adminAuditLogs as auditLogs } from './adminAuditLogs.js';
import { adminNotifications as notifications } from './adminNotifications.js';
import { adminRoles as roles } from './adminRoles.js';
import { adminSettings as settings } from './adminSettings.js';
import { adminDashboard as dashboard } from './adminDashboard.js';

export const adminApi = {
  organizations, users, calls, subscriptions, plans, billing, usage,
  cogs, analytics, auditLogs, notifications, roles, settings, dashboard,
};

export default adminApi;
