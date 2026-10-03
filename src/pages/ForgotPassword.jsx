/**
 * /forgot-password — request a reset link.
 *
 * Wired to `POST /auth/forgot-password`. The confirmation screen is shown for a
 * successful call *and* when the endpoint isn't deployed yet — either way the
 * response must not reveal whether the address has an account.
 */

import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MailCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import AuthLayout, { AuthHeading } from '../auth/AuthLayout.jsx';
import { TextField, SubmitButton, FormBanner } from '../auth/fields.jsx';
import { isEmail } from '../auth/validation.js';
import { describeAuthError, isEndpointUnavailable } from '../auth/authErrors.js';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [banner, setBanner] = useState('');
  const inputRef = useRef(null);

  const error = useMemo(() => {
    if (!email.trim()) return 'Enter your work email.';
    if (!isEmail(email)) return 'That doesn’t look like a valid email address.';
    return '';
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setTouched(true);
    if (error) return inputRef.current?.focus();

    setBanner('');
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      // A missing route or a 404/"no such user" must look identical to success.
      if (isEndpointUnavailable(err) || err?.statusCode === 404) {
        setSent(true);
      } else if (err?.statusCode === 429) {
        setBanner('Too many requests. Wait a minute before trying again.');
      } else {
        setBanner(describeAuthError(err, 'forgot'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout headerCta={{ prompt: 'Remembered it?', label: 'Log in', to: '/login' }}>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <MailCheck size={22} aria-hidden="true" />
          </span>
          <AuthHeading
            title="Check your inbox"
            subtitle={
              <>
                If an account exists for <span className="font-medium text-slate-700">{email.trim()}</span>,
                we&rsquo;ve sent password reset instructions. The link expires in 60 minutes.
              </>
            }
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
          Didn&rsquo;t get it? Check spam, or{' '}
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setBanner('');
            }}
            className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
          >
            try a different email
          </button>
          .
        </div>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout headerCta={{ prompt: 'Remembered it?', label: 'Log in', to: '/login' }}>
      <AuthHeading
        title="Reset your password"
        subtitle="Enter your work email and we’ll send you a secure password reset link."
      />
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {banner && <FormBanner tone="error">{banner}</FormBanner>}
        <TextField
          ref={inputRef}
          label="Work email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (banner) setBanner('');
          }}
          onBlur={() => setTouched(true)}
          error={touched ? error : undefined}
          icon={Mail}
          required
        />
        <SubmitButton loading={submitting} loadingText="Sending…">
          Send reset link
        </SubmitButton>
      </form>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to login
      </Link>
    </AuthLayout>
  );
}
