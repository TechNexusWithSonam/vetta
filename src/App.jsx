import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import RequireAuth from './components/RequireAuth';
import RequireSession from './components/RequireSession';
import RedirectIfAuthed from './components/RedirectIfAuthed';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './auth/Toast.jsx';

// Public marketing site (src/marketing/)
import MarketingLayout from './marketing/MarketingLayout.jsx';
import {
  Home,
  Platform,
  AiResearch,
  AiCalling,
  Sequences,
  MarketingIntegrations,
  Pricing,
  Resources,
  CaseStudies,
  Contact,
} from './marketing/pages/index.js';

// Authentication screens (shared layout + components under src/auth/)
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Onboarding from './pages/Onboarding';

// Private app pages (mounted under /app/*)
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LiveCalls from './pages/LiveCalls';
import Workflow from './pages/Workflow';
import Settings from './pages/Settings';
import Research from './pages/Research';
import Bookings from './pages/Bookings';
import Analytics from './pages/Analytics';
import LaunchCampaign from './pages/LaunchCampaign';
import ImportLeads from './pages/ImportLeads';
import NotFound from './pages/NotFound';

// Super Admin panel (mounted under /admin/*) — see src/admin/README.md
import RequireSuperAdmin from './admin/rbac/RequireSuperAdmin.jsx';
import RequirePermission, { AdminHome } from './admin/rbac/RequirePermission.jsx';
import { PERMISSIONS as ADMIN_P } from './admin/rbac/permissions.js';
import AdminLogin from './admin/pages/AdminLogin.jsx';
import AdminLayout from './admin/layout/AdminLayout.jsx';
import AdminDashboard from './admin/pages/Dashboard.jsx';
import OrganizationsList from './admin/pages/organizations/OrganizationsList.jsx';
import OrganizationDetail from './admin/pages/organizations/OrganizationDetail.jsx';
import AdminUsers from './admin/pages/Users.jsx';
import AdminCalls from './admin/pages/Calls.jsx';
import AdminSubscriptions from './admin/pages/Subscriptions.jsx';
import AdminPlans from './admin/pages/Plans.jsx';
import AdminBilling from './admin/pages/Billing.jsx';
import AdminUsage from './admin/pages/Usage.jsx';
import AdminCogs from './admin/pages/Cogs.jsx';
import AdminAnalytics from './admin/pages/Analytics.jsx';
import AdminRolesPermissions from './admin/pages/RolesPermissions.jsx';
import AdminNotifications from './admin/pages/Notifications.jsx';
import AdminAuditLogs from './admin/pages/AuditLogs.jsx';
import AdminSystemSettings from './admin/pages/SystemSettings.jsx';
import AdminIntegrations from './pages/Integrations';

// Old top-level app paths → their new /app/* home, so existing links/bookmarks
// keep working. `/integrations` is intentionally absent — it now belongs to the
// marketing site; integrations are managed from the Super Admin panel at
// `/admin/integrations`.
const LEGACY_APP_PATHS = [
  'dashboard',
  'leads',
  'live-calls',
  'workflow',
  'settings',
  'research',
  'bookings',
  'analytics',
  'launch-campaign',
  'import-leads',
];

// /app/integrations moved to the Super Admin panel. Keep the query string so
// an OAuth return like `?connected=google` still reaches the page.
function IntegrationsMovedRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/admin/integrations${search}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public marketing site */}
            <Route path="/" element={<MarketingLayout />}>
              <Route index element={<Home />} />
              <Route path="platform" element={<Platform />} />
              <Route path="ai-research" element={<AiResearch />} />
              <Route path="ai-calling" element={<AiCalling />} />
              <Route path="sequences" element={<Sequences />} />
              <Route path="integrations" element={<MarketingIntegrations />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="resources" element={<Resources />} />
              <Route path="case-studies" element={<CaseStudies />} />
              <Route path="contact" element={<Contact />} />
            </Route>

            {/* Public auth — bounce to the app if already signed in */}
            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <LogIn />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/signup"
              element={
                <RedirectIfAuthed>
                  <SignUp />
                </RedirectIfAuthed>
              }
            />
            <Route path="/register" element={<Navigate to="/signup" replace />} />
            <Route
              path="/forgot-password"
              element={
                <RedirectIfAuthed>
                  <ForgotPassword />
                </RedirectIfAuthed>
              }
            />
            {/* Reachable while signed in or out — it's an action page keyed by token */}
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Post-signup gates — a session is required, the page is the gate */}
            <Route
              path="/verify-email"
              element={
                <RequireSession>
                  <VerifyEmail />
                </RequireSession>
              }
            />
            <Route
              path="/onboarding"
              element={
                <RequireSession>
                  <Onboarding />
                </RequireSession>
              }
            />

            {/* Private app — gated by auth + verification + onboarding */}
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="live-calls" element={<LiveCalls />} />
              <Route path="workflow" element={<Workflow />} />
              <Route path="settings" element={<Settings />} />
              <Route path="research" element={<Research />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="integrations" element={<IntegrationsMovedRedirect />} />
              <Route path="launch-campaign" element={<LaunchCampaign />} />
              <Route path="import-leads" element={<ImportLeads />} />
            </Route>

            {/* Super Admin — its own login, separate from the customer auth funnel */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <RequireSuperAdmin>
                  <AdminLayout />
                </RequireSuperAdmin>
              }
            >
              <Route index element={<AdminHome />} />
              <Route path="dashboard" element={<RequirePermission permission={ADMIN_P.DASHBOARD_VIEW}><AdminDashboard /></RequirePermission>} />
              <Route path="organizations" element={<RequirePermission permission={ADMIN_P.ORGANIZATIONS_VIEW}><OrganizationsList /></RequirePermission>} />
              <Route path="organizations/:orgId" element={<RequirePermission permission={ADMIN_P.ORGANIZATIONS_VIEW}><OrganizationDetail /></RequirePermission>} />
              <Route path="users" element={<RequirePermission permission={ADMIN_P.USERS_VIEW}><AdminUsers /></RequirePermission>} />
              <Route path="calls" element={<RequirePermission permission={ADMIN_P.CALLS_VIEW}><AdminCalls /></RequirePermission>} />
              <Route path="subscriptions" element={<RequirePermission permission={ADMIN_P.SUBSCRIPTIONS_VIEW}><AdminSubscriptions /></RequirePermission>} />
              <Route path="plans" element={<RequirePermission permission={ADMIN_P.PLANS_VIEW}><AdminPlans /></RequirePermission>} />
              <Route path="billing" element={<RequirePermission permission={ADMIN_P.BILLING_VIEW}><AdminBilling /></RequirePermission>} />
              <Route path="usage" element={<RequirePermission permission={ADMIN_P.USAGE_VIEW}><AdminUsage /></RequirePermission>} />
              <Route path="cogs" element={<RequirePermission permission={ADMIN_P.COGS_VIEW}><AdminCogs /></RequirePermission>} />
              <Route path="analytics" element={<RequirePermission permission={ADMIN_P.ANALYTICS_VIEW}><AdminAnalytics /></RequirePermission>} />
              <Route path="roles" element={<RequirePermission permission={ADMIN_P.ROLES_VIEW}><AdminRolesPermissions /></RequirePermission>} />
              <Route path="notifications" element={<RequirePermission permission={ADMIN_P.NOTIFICATIONS_VIEW}><AdminNotifications /></RequirePermission>} />
              <Route path="audit-logs" element={<RequirePermission permission={ADMIN_P.AUDIT_LOGS_VIEW}><AdminAuditLogs /></RequirePermission>} />
              <Route path="integrations" element={<RequirePermission permission={ADMIN_P.SETTINGS_VIEW}><AdminIntegrations /></RequirePermission>} />
              <Route path="settings" element={<RequirePermission permission={ADMIN_P.SETTINGS_VIEW}><AdminSystemSettings /></RequirePermission>} />
            </Route>

            {/* Legacy redirects: /dashboard → /app/dashboard, etc. */}
            {LEGACY_APP_PATHS.map((p) => (
              <Route key={p} path={`/${p}`} element={<Navigate to={`/app/${p}`} replace />} />
            ))}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
