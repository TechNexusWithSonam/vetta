/**
 * /login — sign in to an existing workspace. Wired to `POST /auth/login`.
 * Security-sensitive: a failed sign-in never says which field was wrong.
 */

import React, { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useToast } from '../auth/useToast.js';
import AuthLayout, { AuthHeading } from '../auth/AuthLayout.jsx';
import {
  TextField,
  PasswordField,
  SubmitButton,
  FormBanner,
  OrDivider,
  SocialAuthButtons,
} from '../auth/fields.jsx';
import { isEmail } from '../auth/validation.js';
import { describeAuthError } from '../auth/authErrors.js';
import { api } from '../api';

const REMEMBER_KEY = 'vetta.auth.rememberedEmail';

export default function LogIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState(() => {
    try {
      return window.localStorage.getItem(REMEMBER_KEY) || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => {
    try {
      return Boolean(window.localStorage.getItem(REMEMBER_KEY));
    } catch {
      return false;
    }
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState('');
  const [social, setSocial] = useState(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const errors = useMemo(() => {
    const e = {};
    if (!email.trim()) e.email = 'Enter your work email.';
    else if (!isEmail(email)) e.email = 'That doesn’t look like a valid email address.';
    if (!password) e.password = 'Enter your password.';
    return e;
  }, [email, password]);

  const showErr = (k) => (touched[k] ? errors[k] : undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setTouched({ email: true, password: true });
    if (errors.email) return emailRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();

    setBanner('');
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      try {
        if (remember) window.localStorage.setItem(REMEMBER_KEY, email.trim());
        else window.localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* ignore */
      }
      toast.success('Signed in.');
      // Land on the intended page (or the dashboard); RequireAuth re-routes to
      // /verify-email or /onboarding if either gate still applies.
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setBanner(describeAuthError(err, 'login'));
      passwordRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const startSocial = (provider) => {
    setSocial(provider);
    try {
      window.location.assign(
        api.auth.oauthStartUrl(provider, location.state?.from?.pathname || '/dashboard'),
      );
    } catch {
      setSocial(null);
      toast.error(`${provider === 'google' ? 'Google' : 'Microsoft'} sign-in isn’t available right now.`);
    }
  };

  return (
    <AuthLayout headerCta={{ prompt: 'New to Vetta?', label: 'Sign up', to: '/signup' }}>
      <AuthHeading title="Welcome back" subtitle="Sign in to continue to your Vetta workspace." />

      <SocialAuthButtons onSelect={startSocial} disabled={Boolean(social) || submitting} />
      <OrDivider />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {banner && <FormBanner tone="error">{banner}</FormBanner>}

        <TextField
          ref={emailRef}
          label="Work email"
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (banner) setBanner('');
          }}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={showErr('email')}
          icon={Mail}
          required
        />

        <PasswordField
          ref={passwordRef}
          label="Password"
          labelRight={
            <Link
              to="/forgot-password"
              className="rounded text-xs font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Forgot password?
            </Link>
          }
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (banner) setBanner('');
          }}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={showErr('password')}
          required
        />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Remember me on this device
        </label>

        <SubmitButton loading={submitting} loadingText="Signing in…">
          Log in
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&rsquo;t have an account?{' '}
        <Link
          to="/signup"
          className="font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
