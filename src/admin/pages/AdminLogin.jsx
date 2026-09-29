/**
 * /admin/login — dedicated Super Admin sign-in, separate from the customer
 * `/login` screen. Same backend (`POST /auth/login`, same token storage via
 * `useAuth()`), just its own page and its own post-login check: a successful
 * login only proceeds into `/admin/*` if the SERVER confirms platform access
 * (`GET /admin/me`) — otherwise it's signed back out and told this account
 * isn't authorized here. Nothing about access is decided client-side.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../auth/useToast.js';
import { TextField, PasswordField, SubmitButton, FormBanner } from '../../auth/fields.jsx';
import { isEmail } from '../../auth/validation.js';
import { describeAuthError } from '../../auth/authErrors.js';
import { api } from '../../api';
import { LoadingState } from '../../components/ui';
import { adminErrorMessage } from '../lib/adminErrors.js';

const DENIED = 'This account isn’t authorized for Super Admin access.';

/** 'granted' | 'denied', or throws for transport/5xx failures. */
async function checkPlatformAccess() {
  try {
    await api.admin.me();
    return 'granted';
  } catch (err) {
    if (err?.statusCode === 403 || err?.statusCode === 401) return 'denied';
    throw err;
  }
}

export default function AdminLogin() {
  const { status, user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(location.state?.denied ? DENIED : '');
  // Already signed in (and not just bounced here as denied): ask the server.
  const [existing, setExisting] = useState('unknown'); // unknown | checking | granted | none
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const errors = useMemo(() => {
    const e = {};
    if (!email.trim()) e.email = 'Enter your email.';
    else if (!isEmail(email)) e.email = 'That doesn’t look like a valid email address.';
    if (!password) e.password = 'Enter your password.';
    return e;
  }, [email, password]);
  const showErr = (k) => (touched[k] ? errors[k] : undefined);

  const skipExistingCheck = !!location.state?.denied;
  useEffect(() => {
    if (status !== 'authenticated' || skipExistingCheck || existing !== 'unknown') return;
    setExisting('checking');
    checkPlatformAccess()
      .then((r) => setExisting(r === 'granted' ? 'granted' : 'none'))
      .catch(() => setExisting('none'));
  }, [status, skipExistingCheck, existing, user?.id]);

  if (existing === 'granted') {
    return <Navigate to={location.state?.from?.pathname || '/admin/dashboard'} replace />;
  }
  if (status === 'loading' || existing === 'checking') return <LoadingState label="Checking session…" />;

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
      let verdict;
      try {
        verdict = await checkPlatformAccess();
      } catch (accessErr) {
        await logout();
        setBanner(adminErrorMessage(accessErr, 'Couldn’t verify admin access. Please retry.'));
        return;
      }
      if (verdict !== 'granted') {
        await logout();
        setBanner(DENIED);
        passwordRef.current?.focus();
        return;
      }
      toast.success('Signed in to Super Admin.');
      navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true });
    } catch (err) {
      setBanner(describeAuthError(err, 'login'));
      passwordRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-slate-950 px-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Vetta Super Admin</h1>
          <p className="mt-1 text-sm text-slate-400">Platform administration — authorized accounts only.</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {banner && <FormBanner tone="error">{banner}</FormBanner>}

            <TextField
              ref={emailRef}
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="username"
              placeholder="you@vetta.ai"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (banner) setBanner(''); }}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={showErr('email')}
              icon={Mail}
              required
            />
            <PasswordField
              ref={passwordRef}
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (banner) setBanner(''); }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={showErr('password')}
              required
            />

            <SubmitButton loading={submitting} loadingText="Signing in…">
              Sign in
            </SubmitButton>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Not an admin? <Link to="/login" className="font-semibold text-slate-300 hover:text-white">Go to the regular sign-in</Link>
        </p>
      </div>
    </div>
  );
}
