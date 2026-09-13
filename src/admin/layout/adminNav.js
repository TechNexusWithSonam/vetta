import {
  LayoutDashboard, Building2, Users, Phone, Repeat, Tag, CreditCard, Gauge,
  Receipt, BarChart2, ShieldCheck, Bell, History, Settings,
} from 'lucide-react';

/**
 * Config array (not inline JSX like AppLayout.jsx) — the mobile drawer and
 * future per-item permission gating need data, not JSX. `permission` is
 * optional and reserved for when scoped admin roles exist; today only
 * SUPER_ADMIN (which holds every permission) ever reaches this layout.
 */
export const ADMIN_NAV = [
  {
    section: 'Overview',
    items: [{ label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    section: 'Tenants',
    items: [
      { label: 'Organizations', to: '/admin/organizations', icon: Building2, permission: 'organizations.view' },
      { label: 'Users', to: '/admin/users', icon: Users, permission: 'users.view' },
      { label: 'Calls', to: '/admin/calls', icon: Phone, permission: 'calls.view' },
    ],
  },
  {
    section: 'Revenue',
    items: [
      { label: 'Subscriptions', to: '/admin/subscriptions', icon: Repeat, permission: 'billing.view' },
      { label: 'Plans & Pricing', to: '/admin/plans', icon: Tag, permission: 'plans.view' },
      { label: 'Billing & Payments', to: '/admin/billing', icon: CreditCard, permission: 'billing.view' },
      { label: 'Usage & Credits', to: '/admin/usage', icon: Gauge, permission: 'billing.view' },
      { label: 'COGS', to: '/admin/cogs', icon: Receipt, permission: 'cogs.view' },
    ],
  },
  {
    section: 'Platform',
    items: [
      { label: 'Analytics', to: '/admin/analytics', icon: BarChart2, permission: 'analytics.view' },
      { label: 'Roles & Permissions', to: '/admin/roles', icon: ShieldCheck, permission: 'roles.manage' },
      { label: 'Notifications', to: '/admin/notifications', icon: Bell },
      { label: 'Audit Logs', to: '/admin/audit-logs', icon: History, permission: 'audit_logs.view' },
      { label: 'System Settings', to: '/admin/settings', icon: Settings, permission: 'settings.manage' },
    ],
  },
];
