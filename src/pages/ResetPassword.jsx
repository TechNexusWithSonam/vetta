/**
 * /reset-password?token=… — set a new password from an emailed link.
 * Wired to `POST /auth/reset-password`.
 */

import React, { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useToast } from '../auth/useToast.js';
import AuthLayout, { AuthHeading } from '../auth/AuthLayout.jsx';
import { PasswordField, SubmitButton, FormBanner } from '../auth/fields.jsx';
import { passwordMeetsPolicy } from '../auth/validation.js';
import { describeAuthError, isEndpointUnavailable } from '../auth/authErrors.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { resetPassword } = useAuth();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState('');
  const [done, setDone] = useState(false);
  const [deadLink, setDeadLink] = useState(!token);
  const pwRef = useRef(null);

  const errors = useMemo(() => {
    const e = {};
    if (!password) e.password = 'Create a new password.';
    else if (!passwordMeetsPolicy(password))
      e.password = 'Your password doesn’t meet all the requirements yet.';
    if (!confirm) e.confirm = 'Re-enter your new password.';
    else if (confirm !== password) e.confirm = 'Passwords don’t match.';
    return e;
  }, [password, confirm]);

  const showErr = (k) => (touched[k] ? errors[k] : undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setTouched({ password: true, confirm: true });
    if (Object.keys(errors).length) return pwRef.current?.focus();

    setBanner('');
    setSubmitting(true);
    try {
      await resetPassword({ token, password });
      setDone(true);
      toast.success('Password updated.');
    } catch (err) {
      if (isEndpointUnavailable(err)) {
        setBanner(
          'Password reset isn’t available on this environment yet. Contact your workspace admin.',
        );
      } else if ([400, 404, 410, 422].includes(err?.statusCode)) {
        setDeadLink(true);
      } else {
        setBanner(describeAuthError(err, 'reset'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (deadLink) {
    return (
      <AuthLayout panel={false}>
        <div className="text-center">
          <AuthHeading
            title="This link is no longer valid"
            subtitle="Password reset links expire after 60 minutes and can only be used once. Request a fresh one to continue."
          />
          <div className="flex flex-col gap-2.5">
            <Link
              to="/forgot-password"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Request a new link
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout panel={false}>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={24} aria-hidden="true" />
          </span>
          <AuthHeading
            title="Password updated successfully"
            subtitle="Your new password is active. Sign in to get back to your workspace."
          />
          <Link
            to="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Log in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout panel={false}>
      <AuthHeading
        title="Choose a new password"
        subtitle="For your security, pick a password you don’t use anywhere else."
      />
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {banner && <FormBanner tone="error">{banner}</FormBanner>}
        <PasswordField
          ref={pwRef}
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (banner) setBanner('');
          }}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={showErr('password')}
          showMeter
          showChecklist
          required
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          error={showErr('confirm')}
          hint={!showErr('confirm') && confirm && confirm === password ? 'Passwords match.' : undefined}
          required
        />
        <SubmitButton loading={submitting} loadingText="Updating…" className="mt-1">
          Reset password
        </SubmitButton>
      </form>
      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <KeyRound size={13} aria-hidden="true" />
        This link works once and expires 60 minutes after it was sent.
      </p>
    </AuthLayout>
  );
}
