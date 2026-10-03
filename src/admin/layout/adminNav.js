import {
  LayoutDashboard, Building2, Users, Phone, Repeat, Tag, CreditCard, Gauge,
  Receipt, BarChart2, ShieldCheck, Bell, History, Settings, Plug, CalendarClock,
} from 'lucide-react';
import { PERMISSIONS as P } from '../rbac/permissions.js';

/**
 * Config array (not inline JSX like AppLayout.jsx) — the mobile drawer and
 * per-item permission gating need data, not JSX. An item is hidden when the
 * operator's server-reported permissions (GET /admin/me) lack `permission`;
 * the API enforces the same permission regardless.
 */
export const ADMIN_NAV = [
  {
    section: 'Overview',
    items: [{ label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, permission: P.DASHBOARD_VIEW }],
  },
  {
    section: 'Tenants',
    items: [
      { label: 'Organizations', to: '/admin/organizations', icon: Building2, permission: P.ORGANIZATIONS_VIEW },
      { label: 'Users', to: '/admin/users', icon: Users, permission: P.USERS_VIEW },
      { label: 'Calls', to: '/admin/calls', icon: Phone, permission: P.CALLS_VIEW },
    ],
  },
  {
    section: 'Revenue',
    items: [
      { label: 'Subscriptions', to: '/admin/subscriptions', icon: Repeat, permission: P.SUBSCRIPTIONS_VIEW },
      { label: 'Plans & Pricing', to: '/admin/plans', icon: Tag, permission: P.PLANS_VIEW },
      { label: 'Billing & Payments', to: '/admin/billing', icon: CreditCard, permission: P.BILLING_VIEW },
      { label: 'Usage & Credits', to: '/admin/usage', icon: Gauge, permission: P.USAGE_VIEW },
      { label: 'COGS', to: '/admin/cogs', icon: Receipt, permission: P.COGS_VIEW },
    ],
  },
  {
    section: 'Platform',
    items: [
      { label: 'Analytics', to: '/admin/analytics', icon: BarChart2, permission: P.ANALYTICS_VIEW },
      { label: 'Roles & Permissions', to: '/admin/roles', icon: ShieldCheck, permission: P.ROLES_VIEW },
      { label: 'Notifications', to: '/admin/notifications', icon: Bell, permission: P.NOTIFICATIONS_VIEW },
      { label: 'Audit Logs', to: '/admin/audit-logs', icon: History, permission: P.AUDIT_LOGS_VIEW },
      { label: 'Calendar & Booking', to: '/admin/calendar', icon: CalendarClock, permission: P.ORGANIZATIONS_VIEW },
      { label: 'Integrations', to: '/admin/integrations', icon: Plug, permission: P.SETTINGS_VIEW },
      { label: 'System Settings', to: '/admin/settings', icon: Settings, permission: P.SETTINGS_VIEW },
    ],
  },
];

/** First nav destination the operator may open — used when /admin/dashboard is not permitted. */
export function firstAllowedPath(can) {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) if (can(item.permission)) return item.to;
  }
  return null;
}
