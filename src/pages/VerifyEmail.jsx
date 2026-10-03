/**
 * /verify-email — post-signup gate.
 *
 * `POST /auth/verify-email` (with a `?token=` from the link) confirms the
 * address; `POST /auth/resend-verification` sends a fresh one behind a cooldown.
 * Neither route is deployed yet, so the screen also offers an explicit
 * "continue" path and treats a missing endpoint as a soft success.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useToast } from '../auth/useToast.js';
import AuthLayout, { AuthHeading } from '../auth/AuthLayout.jsx';
import { FormBanner } from '../auth/fields.jsx';
import { isEndpointUnavailable } from '../auth/authErrors.js';

const RESEND_COOLDOWN = 45;

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const {
    needsVerification,
    onboardingComplete,
    pendingVerificationEmail,
    verifyEmail,
    resendVerification,
    clearPendingVerification,
    logout,
  } = useAuth();
  const toast = useToast();

  const [phase, setPhase] = useState(token ? 'verifying' : 'idle'); // verifying | idle | verified | expired
  const [banner, setBanner] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const ranToken = useRef(false);

  // Auto-verify when arriving from the email link.
  useEffect(() => {
    if (!token || ranToken.current) return;
    ranToken.current = true;
    (async () => {
      try {
        await verifyEmail(token);
        setPhase('verified');
        toast.success('Email verified successfully.');
      } catch (err) {
        if (isEndpointUnavailable(err)) {
          setPhase('idle');
          setBanner('We couldn’t reach the verification service. You can continue and verify later.');
        } else {
          setPhase('expired');
        }
      }
    })();
  }, [token, verifyEmail, toast]);

  // Cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Move on once this step no longer applies.
  useEffect(() => {
    if (phase === 'verified') {
      const t = setTimeout(
        () => navigate(onboardingComplete ? '/dashboard' : '/onboarding', { replace: true }),
        1400,
      );
      return () => clearTimeout(t);
    }
  }, [phase, onboardingComplete, navigate]);

  if (!needsVerification && phase !== 'verified') {
    return <Navigate to={onboardingComplete ? '/dashboard' : '/onboarding'} replace />;
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setBanner('');
    try {
      await resendVerification();
      toast.success('Verification email sent.');
    } catch (err) {
      if (isEndpointUnavailable(err)) {
        toast.info('If that address needs verification, a new email is on its way.');
      } else if (err?.statusCode === 429) {
        toast.error('Please wait a moment before requesting another email.');
      } else {
        toast.error('Couldn’t send the email just now. Try again shortly.');
      }
    } finally {
      setResending(false);
      setCooldown(RESEND_COOLDOWN);
    }
  };

  const handleChangeEmail = async () => {
    await logout();
    navigate('/signup', { replace: true });
  };

  const handleContinue = () => {
    clearPendingVerification();
    navigate(onboardingComplete ? '/dashboard' : '/onboarding', { replace: true });
  };

  if (phase === 'verifying') {
    return (
      <AuthLayout panel={false}>
        <div className="flex flex-col items-center py-10 text-center">
          <Loader2 size={28} className="animate-spin text-indigo-600" aria-hidden="true" />
          <p className="mt-4 text-sm font-medium text-slate-600">Verifying your email…</p>
        </div>
      </AuthLayout>
    );
  }

  if (phase === 'verified') {
    return (
      <AuthLayout panel={false}>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={24} aria-hidden="true" />
          </span>
          <AuthHeading
            title="Email verified successfully"
            subtitle="Taking you to your workspace setup…"
          />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout panel={false}>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          {phase === 'expired' ? <RefreshCw size={22} /> : <MailCheck size={22} />}
        </span>
        <AuthHeading
          title={phase === 'expired' ? 'That link has expired' : 'Verify your email'}
          subtitle={
            phase === 'expired' ? (
              'Verification links expire after 24 hours. Send yourself a fresh one below.'
            ) : (
              <>
                We&rsquo;ve sent a verification link to{' '}
                <span className="font-medium text-slate-700">
                  {pendingVerificationEmail || 'your work email'}
                </span>
                . Click it to activate your workspace.
              </>
            )
          }
        />
      </div>

      {banner && (
        <div className="mb-4">
          <FormBanner tone="info">{banner}</FormBanner>
        </div>
      )}

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resending ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw size={15} aria-hidden="true" />
          )}
          {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend verification email'}
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        >
          Continue to workspace setup
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Wrong address?{' '}
        <button
          type="button"
          onClick={handleChangeEmail}
          className="font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Change email
        </button>
      </p>
    </AuthLayout>
  );
}
