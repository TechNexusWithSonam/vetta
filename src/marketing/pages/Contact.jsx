/**
 * /contact — "Book a demo" form. Wired to the `demoRequests` service (currently
 * a mock adapter — see src/services/). Inline validation, loading + error +
 * success states.
 */

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Building2, MailX, AlertCircle } from 'lucide-react';
import { Button, Input, Textarea, Select } from '../../components/ui/index.js';
import { Section } from '../components/layout.jsx';
import { demoRequests } from '../../services/demoRequests.js';

const ROLES = ['Sales / AE', 'SDR / BDR', 'Sales leadership', 'RevOps', 'Founder / CEO', 'Marketing', 'Other'];
const TEAM_SIZES = ['Just me', '2–10', '11–50', '51–200', '201–1,000', '1,000+'];
const EMPTY = { name: '', email: '', company: '', role: '', teamSize: '', goal: '' };

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const TRUST = [
  { icon: ShieldCheck, title: 'Secure', text: 'Your details are encrypted in transit and never sold.' },
  { icon: Building2, title: 'Business-focused', text: 'A working session on your ICP — not a generic pitch.' },
  { icon: MailX, title: 'No spam', text: 'One follow-up to schedule. Unsubscribe any time.' },
];

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = 'Enter your name.';
    if (!form.email.trim()) e.email = 'Enter your work email.';
    else if (!isEmail(form.email)) e.email = 'That doesn’t look like a valid email.';
    if (!form.company.trim()) e.company = 'Enter your company.';
    return e;
  }, [form]);

  const showErr = (key) => (touched[key] ? errors[key] : undefined);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setTouched({ name: true, email: true, company: true });
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setError('');
    try {
      await demoRequests.submit({ ...form, source: 'marketing/contact' });
      setDone(true);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section tone="subtle" size="lg" containerSize="wide">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Contact</p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900">
              Let’s build your outbound engine.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Tell us a little about your team and what you’re trying to achieve. We’ll come back with
              a build tailored to your ICP.
            </p>
            <ul className="mt-8 space-y-5">
              {TRUST.map((t) => (
                <li key={t.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-inset ring-slate-200">
                    <t.icon size={17} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{t.title}</span>
                    <span className="block text-sm text-slate-500">{t.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-slate-500">
              Prefer to explore first?{' '}
              <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
                Start for free
              </Link>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            {done ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={24} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">Request received</h2>
                <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                  Thanks, {form.name.split(' ')[0] || 'there'}. We’ll email {form.email} shortly to
                  find a time.
                </p>
                <Button as={Link} to="/" variant="secondary" className="mt-6">
                  Back to home
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Name"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={set('name')}
                    onBlur={blur('name')}
                    error={showErr('name')}
                  />
                  <Input
                    label="Work email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={set('email')}
                    onBlur={blur('email')}
                    error={showErr('email')}
                  />
                </div>
                <Input
                  label="Company"
                  autoComplete="organization"
                  required
                  value={form.company}
                  onChange={set('company')}
                  onBlur={blur('company')}
                  error={showErr('company')}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Role" optional placeholder="Select…" value={form.role} onChange={set('role')}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="Team size"
                    optional
                    placeholder="Select…"
                    value={form.teamSize}
                    onChange={set('teamSize')}
                  >
                    {TEAM_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
                <Textarea
                  label="What are you looking to achieve?"
                  optional
                  rows={4}
                  value={form.goal}
                  onChange={set('goal')}
                  placeholder="e.g. cover our outbound list with AI first-touch and put reps on qualified calls only"
                />
                <Button type="submit" fullWidth size="lg" loading={submitting}>
                  {submitting ? 'Sending…' : 'Book a demo'}
                </Button>
                <p className="text-center text-xs text-slate-400">
                  By submitting you agree to our{' '}
                  <a href="/legal/privacy" className="underline underline-offset-2 hover:text-slate-600">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            )}
        </div>
      </div>
    </Section>
  );
}
