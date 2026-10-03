/**
 * Guard for the private app (the `AppLayout` section).
 *
 * - Not signed in            → `/login`, remembering the intended path.
 * - Signed in, email pending → `/verify-email`.
 * - Signed in, no onboarding → `/onboarding`.
 * - Otherwise                → render the app.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import AuthLoading from '../auth/AuthLoading.jsx';

export default function RequireAuth({ children }) {
  const { status, needsVerification, onboardingComplete } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <AuthLoading />;

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (needsVerification) return <Navigate to="/verify-email" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;

  return children;
}
