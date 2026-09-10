import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Integrations from './pages/Integrations';
import LaunchCampaign from './pages/LaunchCampaign';
import ImportLeads from './pages/ImportLeads';
import NotFound from './pages/NotFound';

// Old top-level app paths → their new /app/* home, so existing links/bookmarks
// keep working. `/integrations` is intentionally absent — it now belongs to the
// marketing site; the app's own page is `/app/integrations`.
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
              <Route path="integrations" element={<Integrations />} />
              <Route path="launch-campaign" element={<LaunchCampaign />} />
              <Route path="import-leads" element={<ImportLeads />} />
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
