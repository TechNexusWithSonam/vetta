/**
 * Guard for the in-between screens (`/verify-email`, `/onboarding`): a valid
 * session is required, but the verification / onboarding gates are *not*
 * enforced here — those pages are the gates. Each page redirects onward itself
 * once its step no longer applies.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import AuthLoading from '../auth/AuthLoading.jsx';

export default function RequireSession({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <AuthLoading />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
