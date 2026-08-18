import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';

// All Pages
import Auth from './pages/Auth';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Route (Handles Login and Sign Up) */}
        <Route path="/login" element={<Auth />} />

        {/* Private Routes - Wrapped in the Sidebar Layout */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
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

        {/* Catch-All 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}