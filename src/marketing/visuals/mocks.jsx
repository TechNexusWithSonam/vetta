/**
 * Branded product mockups for the marketing pages. These are illustrative
 * compositions built from the design system — not screenshots, not stock art,
 * and not wired to any API. All decorative, so `aria-hidden`.
 *
 * Numbers shown are clearly-fictional sample data for layout only.
 */

import React from 'react';
import {
  Phone,
  PhoneCall,
  CalendarCheck,
  Sparkles,
  Building2,
  TrendingUp,
  Mail,
  MessageCircle,
  Clock,
  GitBranch,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../components/ui/index.js';

/** Window chrome so a mock reads as "a product", not a diagram. */
export function BrowserFrame({ label = 'app.vetta.io', className = '', children }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </span>
        <span className="mx-auto rounded-md bg-white px-3 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-slate-200">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

const Bar = ({ h }) => (
  <div className="flex-1 rounded-t bg-gradient-to-t from-brand-500 to-brand-400" style={{ height: `${h}%` }} />
);

export function DashboardMock({ className = '' }) {
  const kpis = [
    { label: 'Calls today', value: '318', icon: PhoneCall, tone: 'text-brand-600 bg-brand-50' },
    { label: 'Conversations', value: '96', icon: Phone, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Qualified', value: '41', icon: Sparkles, tone: 'text-amber-600 bg-amber-50' },
    { label: 'Meetings', value: '12', icon: CalendarCheck, tone: 'text-blue-600 bg-blue-50' },
  ];
  const bars = [38, 52, 44, 63, 71, 58, 82, 76, 90, 68, 84, 95];
  return (
    <BrowserFrame className={className}>
      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-200 p-3">
                <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-lg', k.tone)}>
                  <k.icon size={15} />
                </span>
                <p className="mt-2 text-lg font-bold text-slate-900">{k.value}</p>
                <p className="text-[11px] text-slate-500">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">Calls over time</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <TrendingUp size={12} /> +18%
            </span>
          </div>
          <div className="mt-4 flex h-28 items-end gap-1.5">
            {bars.map((h, i) => (
              <Bar key={i} h={h} />
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {['Meeting booked — Northwind Traders', 'Qualified — Contoso Retail', 'Callback set — Globex'].map(
              (t) => (
                <div key={t} className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                  {t}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function CallConsoleMock({ className = '' }) {
  const transcript = [
    { who: 'AI', text: 'Hi, this is Ava calling from Vetta on a recorded line — did I catch you at an OK time?' },
    { who: 'Prospect', text: 'Sure, I have a minute.' },
    { who: 'AI', text: 'Appreciate it. We help RevOps teams cut speed-to-lead — how are you handling outbound dials today?' },
    { who: 'Prospect', text: 'Mostly manual. It’s a bottleneck.' },
  ];
  return (
    <BrowserFrame label="app.vetta.io/calls/live" className={className}>
      <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
        <div className="border-slate-100 p-5 sm:border-r">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Connected
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <Clock size={13} /> 02:14
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              MR
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Maria Reyes</p>
              <p className="text-xs text-slate-500">VP RevOps · Northwind Traders</p>
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            {transcript.map((line, i) => (
              <div key={i} className="text-xs">
                <span
                  className={cn(
                    'font-semibold',
                    line.who === 'AI' ? 'text-brand-600' : 'text-slate-500',
                  )}
                >
                  {line.who}
                </span>
                <p className="mt-0.5 leading-relaxed text-slate-600">{line.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI actions</p>
          {[
            { icon: CheckCircle2, text: 'Live pickup detected', tone: 'text-emerald-600' },
            { icon: Sparkles, text: 'Matched pain: manual dialing', tone: 'text-brand-600' },
            { icon: CalendarCheck, text: 'Offering Thu 2:00pm slot', tone: 'text-blue-600' },
          ].map((a) => (
            <div key={a.text} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
              <a.icon size={14} className={a.tone} />
              {a.text}
            </div>
          ))}
          <div className="rounded-lg bg-slate-900 px-3 py-2.5 text-xs text-slate-100">
            <p className="font-semibold text-white">Outcome</p>
            <p className="mt-0.5 text-slate-300">Qualified → meeting proposed</p>
          </div>
          <div className="flex gap-2 pt-1">
            <span className="flex-1 rounded-lg bg-brand-600 py-2 text-center text-xs font-semibold text-white">
              Hand to rep
            </span>
            <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
              Notes
            </span>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function ResearchPanelMock({ className = '' }) {
  return (
    <BrowserFrame label="app.vetta.io/prospects/northwind" className={className}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Building2 size={20} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Northwind Traders</p>
            <p className="text-xs text-slate-500">B2B logistics · 480 employees · Chicago, IL</p>
          </div>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
            Fit 92
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ['Revenue', '$60–80M'],
            ['Funding', 'Series B'],
            ['Growth', '+22% YoY'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-slate-200 py-2">
              <p className="text-[11px] text-slate-400">{k}</p>
              <p className="text-xs font-semibold text-slate-800">{v}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent signals</p>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
          {['Hiring 6 SDRs (careers page)', 'Opened a West-coast DC last month', 'CRO mentioned "pipeline gaps" on a podcast'].map(
            (s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {s}
              </li>
            ),
          )}
        </ul>

        <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 p-3">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700">
            <Sparkles size={12} /> AI call angle
          </p>
          <p className="mt-1 text-xs leading-relaxed text-brand-950/80">
            Lead with the new DC opening — headcount is scaling faster than tooling. Tie manual
            dialing to the "pipeline gaps" the CRO already named publicly.
          </p>
        </div>
      </div>
    </BrowserFrame>
  );
}

const SEQ_STEPS = [
  { icon: Phone, label: 'AI call', meta: 'Day 1' },
  { icon: Clock, label: 'Wait 2 days', meta: 'no answer' },
  { icon: Mail, label: 'Email', meta: 'Day 3 · personalized' },
  { icon: MessageCircle, label: 'LinkedIn touch', meta: 'Day 4' },
  { icon: Phone, label: 'Follow-up call', meta: 'Day 6' },
  { icon: CalendarCheck, label: 'Book meeting', meta: 'on positive reply' },
];

export function SequenceBuilderMock({ className = '' }) {
  return (
    <BrowserFrame label="app.vetta.io/sequences/outbound-q3" className={className}>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Outbound — Q3</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Running
          </span>
        </div>
        <ol className="relative space-y-2 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-px before:bg-slate-200">
          {SEQ_STEPS.map((step, i) => (
            <li key={i} className="relative flex items-center gap-3">
              <span
                className={cn(
                  'z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
                  i === SEQ_STEPS.length - 1
                    ? 'bg-brand-600 text-white ring-brand-600'
                    : 'bg-white text-slate-500 ring-slate-200',
                )}
              >
                <step.icon size={16} />
              </span>
              <div className="flex-1 rounded-lg border border-slate-200 px-3 py-2">
                <p className="text-xs font-semibold text-slate-800">{step.label}</p>
                <p className="text-[11px] text-slate-500">{step.meta}</p>
              </div>
              {i === 1 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                  <GitBranch size={10} /> branch
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </BrowserFrame>
  );
}

/** Horizontal numbered rail — Find → Research → Call → Qualify → Follow-up → Book. */
export function WorkflowRail({ steps = [], className = '' }) {
  return (
    <ol className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-6', className)} aria-hidden="true">
      {steps.map((step, i) => (
        <li key={step.label} className="relative">
          <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tabular-nums text-brand-600">
                {String(i + 1).padStart(2, '0')}
              </span>
              {step.icon && <step.icon size={15} className="text-slate-400" />}
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">{step.label}</p>
            {step.hint && <p className="mt-0.5 text-xs text-slate-500">{step.hint}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
