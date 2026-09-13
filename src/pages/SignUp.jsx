/**
 * /signup — create a Vetta account. Wired to `POST /auth/register`, which
 * creates the organization and signs the user straight in; we then route
 * through `/verify-email`.
 */

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Building2, Check } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useToast } from '../auth/useToast.js';
import AuthLayout, { AuthHeading, AuthLegal } from '../auth/AuthLayout.jsx';
import {
  TextField,
  PasswordField,
  SelectField,
  SubmitButton,
  FormBanner,
  OrDivider,
  SocialAuthButtons,
} from '../auth/fields.jsx';
import {
  isEmail,
  isFreemailDomain,
  passwordMeetsPolicy,
  clean,
} from '../auth/validation.js';
import { describeAuthError } from '../auth/authErrors.js';
import { api } from '../api';

const JOB_ROLES = [
  'Sales / Account Executive',
  'SDR / BDR',
  'Sales Leadership',
  'Founder / CEO',
  'RevOps',
  'Marketing',
  'Agency / Consultant',
  'Other',
];
const COMPANY_SIZES = ['Just me', '2–10', '11–50', '51–200', '201–1,000', '1,000+'];

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  organizationName: '',
  password: '',
  confirmPassword: '',
  jobRole: '',
  companySize: '',
};

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null); // { tone, node }
  const [social, setSocial] = useState(null);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (banner) setBanner(null);
  };
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  const errors = useMemo(() => {
    const e = {};
    if (!clean(form.firstName)) e.firstName = 'Enter your first name.';
    if (!clean(form.lastName)) e.lastName = 'Enter your last name.';
    if (!form.email.trim()) e.email = 'Enter your work email.';
    else if (!isEmail(form.email)) e.email = 'That doesn’t look like a valid email address.';
    if (!clean(form.organizationName)) e.organizationName = 'Enter your company or organization name.';
    if (!form.password) e.password = 'Create a password.';
    else if (!passwordMeetsPolicy(form.password))
      e.password = 'Your password doesn’t meet all the requirements yet.';
    if (!form.confirmPassword) e.confirmPassword = 'Re-enter your password.';
    else if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords don’t match.';
    return e;
  }, [form]);

  const showErr = (key) => (touched[key] ? errors[key] : undefined);
  const emailValid = form.email.trim() && isEmail(form.email) && !errors.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setTouched(
      Object.keys(EMPTY).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
    );
    if (Object.keys(errors).length) {
      // Focus the first field the browser will now mark invalid.
      const form = e.currentTarget;
      requestAnimationFrame(() => form.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }

    setBanner(null);
    setSubmitting(true);
    try {
      await register({
        firstName: clean(form.firstName),
        lastName: clean(form.lastName),
        email: form.email.trim(),
        organizationName: clean(form.organizationName),
        password: form.password,
      });
      // Non-blocking: stash the optional profile answers for onboarding.
      if (form.jobRole || form.companySize) {
        try {
          window.sessionStorage.setItem(
            'vetta.signup.profile',
            JSON.stringify({ jobRole: form.jobRole, companySize: form.companySize }),
          );
        } catch {
          /* ignore */
        }
      }
      toast.success('Account created. Just verify your email to finish.');
      navigate('/verify-email', { replace: true });
    } catch (err) {
      if (err?.statusCode === 409) {
        setBanner({
          tone: 'error',
          node: (
            <>
              An account already exists with this email.{' '}
              <Link to="/login" className="font-semibold underline underline-offset-2">
                Log in instead
              </Link>
              .
            </>
          ),
        });
      } else {
        setBanner({ tone: 'error', node: describeAuthError(err, 'signup') });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startSocial = (provider) => {
    setSocial(provider);
    try {
      window.location.assign(api.auth.oauthStartUrl(provider, '/onboarding'));
    } catch {
      setSocial(null);
      toast.error(`${provider === 'google' ? 'Google' : 'Microsoft'} sign-up isn’t available right now.`);
    }
  };

  return (
    <AuthLayout
      width="lg"
      headerCta={{ prompt: 'Already have an account?', label: 'Log in', to: '/login' }}
    >
      <AuthHeading
        title="Create your Vetta account"
        subtitle="Start building AI-powered outbound campaigns and calls."
      />

      <SocialAuthButtons onSelect={startSocial} disabled={Boolean(social) || submitting} />
      <OrDivider />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {banner && <FormBanner tone={banner.tone}>{banner.node}</FormBanner>}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            autoComplete="given-name"
            value={form.firstName}
            onChange={set('firstName')}
            onBlur={blur('firstName')}
            error={showErr('firstName')}
            icon={User}
            required
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            value={form.lastName}
            onChange={set('lastName')}
            onBlur={blur('lastName')}
            error={showErr('lastName')}
            required
          />
        </div>

        <TextField
          label="Work email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={set('email')}
          onBlur={blur('email')}
          error={showErr('email')}
          hint={
            !showErr('email') && form.email && isFreemailDomain(form.email)
              ? 'A work email unlocks team features like shared workspaces.'
              : undefined
          }
          icon={Mail}
          trailing={
            emailValid ? (
              <span className="flex h-8 w-8 items-center justify-center text-emerald-500" aria-hidden="true">
                <Check size={16} />
              </span>
            ) : undefined
          }
          required
        />

        <TextField
          label="Company / Organization"
          autoComplete="organization"
          placeholder="Acme Inc."
          value={form.organizationName}
          onChange={set('organizationName')}
          onBlur={blur('organizationName')}
          error={showErr('organizationName')}
          icon={Building2}
          required
        />

        <PasswordField
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          onBlur={blur('password')}
          error={showErr('password')}
          showMeter
          showChecklist
          required
        />

        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          onBlur={blur('confirmPassword')}
          error={showErr('confirmPassword')}
          hint={
            !showErr('confirmPassword') &&
            form.confirmPassword &&
            form.confirmPassword === form.password
              ? 'Passwords match.'
              : undefined
          }
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Job role"
            optional
            value={form.jobRole}
            onChange={set('jobRole')}
          >
            <option value="">Select…</option>
            {JOB_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Company size"
            optional
            value={form.companySize}
            onChange={set('companySize')}
          >
            <option value="">Select…</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
        </div>

        <SubmitButton loading={submitting} loadingText="Creating account…" className="mt-2">
          Create account
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Log in
        </Link>
      </p>

      <AuthLegal />
    </AuthLayout>
  );
}
