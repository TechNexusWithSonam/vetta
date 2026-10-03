/**
 * /onboarding — a three-question setup wizard shown once after verification.
 *
 * There is no onboarding API, so answers are recorded locally (and pushed
 * best-effort to the server) via `markOnboardingComplete`. Every question is
 * skippable; finishing or skipping clears the gate and lands on the dashboard.
 */

import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight, PartyPopper } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { AuthLogo } from '../auth/AuthLayout.jsx';

const TEAM_TYPES = [
  'Sales',
  'SDR / BDR',
  'Founder',
  'RevOps',
  'Marketing',
  'Agency',
  'Other',
];

const GOALS = [
  'Find prospects',
  'AI-assisted calling',
  'Cold outbound',
  'Email sequences',
  'LinkedIn outreach',
  'Book more meetings',
  'Automate follow-ups',
];

const TEAM_SIZES = ['Just me', '2–10', '11–50', '51–200', '200+'];

function readSignupProfile() {
  try {
    return JSON.parse(window.sessionStorage.getItem('vetta.signup.profile') || '{}') || {};
  } catch {
    return {};
  }
}

function OptionButton({ selected, onClick, children, multi }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
        selected
          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <span>{children}</span>
      <span
        className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${
          multi ? 'rounded-md' : 'rounded-full'
        } ${selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}`}
      >
        {selected && <Check size={13} aria-hidden="true" />}
      </span>
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { onboardingComplete, markOnboardingComplete, user } = useAuth();
  const seed = useMemo(() => readSignupProfile(), []);

  const [step, setStep] = useState(0); // 0..2 questions, 3 = done screen
  const [teamType, setTeamType] = useState(() => {
    const role = (seed.jobRole || '').toLowerCase();
    if (role.includes('sdr') || role.includes('bdr')) return 'SDR / BDR';
    if (role.includes('founder') || role.includes('ceo')) return 'Founder';
    if (role.includes('revops')) return 'RevOps';
    if (role.includes('marketing')) return 'Marketing';
    if (role.includes('agency') || role.includes('consult')) return 'Agency';
    if (role.includes('sales')) return 'Sales';
    return '';
  });
  const [goals, setGoals] = useState([]);
  const [teamSize, setTeamSize] = useState(() => {
    const s = seed.companySize || '';
    if (s === 'Just me') return 'Just me';
    if (['2–10'].includes(s)) return '2–10';
    if (['11–50'].includes(s)) return '11–50';
    if (['51–200'].includes(s)) return '51–200';
    if (['201–1,000', '1,000+'].includes(s)) return '200+';
    return '';
  });

  if (onboardingComplete) return <Navigate to="/dashboard" replace />;

  const TOTAL = 3;
  const toggleGoal = (g) =>
    setGoals((list) => (list.includes(g) ? list.filter((x) => x !== g) : [...list, g]));

  const finish = (skipped) => {
    markOnboardingComplete({ teamType, goals, teamSize, skipped: Boolean(skipped) });
    navigate('/dashboard', { replace: true });
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const steps = [
    {
      title: 'Tell us about your team',
      hint: 'This tailors the templates and playbooks we surface first.',
      body: (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {TEAM_TYPES.map((t) => (
            <OptionButton key={t} selected={teamType === t} onClick={() => setTeamType(t)}>
              {t}
            </OptionButton>
          ))}
        </div>
      ),
      canContinue: true,
    },
    {
      title: 'What are you looking to accomplish?',
      hint: 'Pick as many as apply — we’ll prioritise these in your workspace.',
      body: (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {GOALS.map((g) => (
            <OptionButton key={g} multi selected={goals.includes(g)} onClick={() => toggleGoal(g)}>
              {g}
            </OptionButton>
          ))}
        </div>
      ),
      canContinue: true,
    },
    {
      title: 'How large is your sales team?',
      hint: 'Helps us set sensible defaults for concurrency and seats.',
      body: (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {TEAM_SIZES.map((s) => (
            <OptionButton key={s} selected={teamSize === s} onClick={() => setTeamSize(s)}>
              {s}
            </OptionButton>
          ))}
        </div>
      ),
      canContinue: true,
    },
  ];

  const isDone = step >= TOTAL;
  const current = steps[step];

  return (
    <div className="flex min-h-svh w-full flex-col bg-white font-sans text-slate-900">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5 sm:px-8">
        <AuthLogo />
        {!isDone && (
          <button
            type="button"
            onClick={() => finish(true)}
            className="rounded text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Skip for now
          </button>
        )}
      </header>

      <main className="flex flex-1 items-start justify-center overflow-y-auto px-5 py-10 sm:py-16">
        <div className="vetta-fade-in w-full max-w-xl">
          {isDone ? (
            <div className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <PartyPopper size={26} aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
                Your workspace is ready
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                {user?.email ? `You're all set, ${user.email.split('@')[0]}. ` : "You're all set. "}
                Import a list, start a research job, or launch your first AI calling campaign whenever
                you’re ready.
              </p>
              <button
                type="button"
                onClick={() => finish(false)}
                className="group mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:scale-[.99] sm:w-auto sm:px-8"
              >
                Go to Vetta
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>
                    Step {step + 1} of {TOTAL}
                  </span>
                  <span aria-hidden="true">
                    {step + 1} / {TOTAL}
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={TOTAL}
                  aria-valuenow={step + 1}
                >
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
                  />
                </div>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{current.title}</h1>
              <p className="mt-1.5 text-sm text-slate-500">{current.hint}</p>

              <div className="mt-6">{current.body}</div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:invisible"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  Back
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={next}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="group inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:scale-[.99]"
                  >
                    {step === TOTAL - 1 ? 'Finish' : 'Continue'}
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
