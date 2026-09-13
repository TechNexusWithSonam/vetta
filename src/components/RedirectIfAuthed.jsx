/**
 * Wraps the fully-public screens (`/login`, `/signup`, `/forgot-password`).
 * An already-authenticated visitor is bounced to wherever they belong in the
 * post-auth chain (verification → onboarding → dashboard), honouring any
 * `location.state.from` set by `RequireAuth`.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import AuthLoading from '../auth/AuthLoading.jsx';
import { postAuthPath } from '../auth/postAuthPath.js';

export default function RedirectIfAuthed({ children }) {
  const { status, needsVerification, onboardingComplete } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <AuthLoading />;

  if (status === 'authenticated') {
    const fallback = postAuthPath({ needsVerification, onboardingComplete });
    const target =
      !needsVerification && onboardingComplete && location.state?.from?.pathname
        ? location.state.from.pathname
        : fallback;
    return <Navigate to={target} replace />;
  }

  return children;
}
