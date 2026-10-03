/**
 * The right-hand product panel shown on wider viewports. Keeps Vetta's deep
 * indigo/purple identity: value headline, four capability cards, a small
 * synthetic product preview, and a quiet testimonial carousel that never
 * out-shouts the form on the left.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  BrainCircuit,
  PhoneCall,
  Layers,
  CalendarSync,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI Research Engine',
    body: 'Find relevant prospects and uncover signals before you call.',
  },
  {
    icon: PhoneCall,
    title: 'AI Voice Calling',
    body: 'Let AI handle conversations while your team focuses on qualified opportunities.',
  },
  {
    icon: Layers,
    title: 'Multi-Channel Sequences',
    body: 'Coordinate email, calling, and LinkedIn outreach from one workflow.',
  },
  {
    icon: CalendarSync,
    title: 'CRM & Calendar Sync',
    body: 'Keep your pipeline and meetings automatically synchronized.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'We pointed Vetta at a cold list on a Monday and had eleven qualified meetings booked by Friday. The AI calls sound human enough that prospects thank us for following up.',
    name: 'Priya Nair',
    role: 'VP Sales',
    company: 'Brightwave Logistics',
    initials: 'PN',
  },
  {
    quote:
      'Our SDRs stopped dialing voicemails. Vetta only routes them live conversations, and connect rates roughly tripled in the first two weeks.',
    name: 'Marcus Webb',
    role: 'Head of RevOps',
    company: 'Orbit Inc',
    initials: 'MW',
  },
  {
    quote:
      'Research, calling, and follow-up used to be three tools and a spreadsheet. Now it is one workflow, and every meeting lands on the AE calendar with a summary attached.',
    name: 'Sara Ellison',
    role: 'Chief Revenue Officer',
    company: 'Cleo Health',
    initials: 'SE',
  },
];

function ProductPreview() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="ml-2 text-[10px] font-medium uppercase tracking-widest text-indigo-200/70">
          Campaign · Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { k: 'Dials today', v: '1,284' },
          { k: 'Live conversations', v: '96' },
          { k: 'Meetings booked', v: '17' },
        ].map((s) => (
          <div key={s.k} className="rounded-lg bg-white/[0.06] p-2.5">
            <p className="text-[10px] leading-tight text-indigo-200/70">{s.k}</p>
            <p className="mt-1 text-sm font-semibold text-white">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex h-16 items-end gap-1.5" aria-hidden="true">
        {[38, 52, 41, 63, 72, 58, 84, 69, 91, 76, 88, 64].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-gradient-to-t from-indigo-400/40 to-indigo-300/80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        {[
          { n: 'Dana Whitfield · CedarOps', t: 'Booked · Thu 2:30pm' },
          { n: 'Leon Park · Northwind', t: 'Callback · Tomorrow' },
        ].map((r) => (
          <div
            key={r.n}
            className="flex items-center justify-between rounded-lg bg-white/[0.05] px-2.5 py-1.5"
          >
            <span className="truncate text-[11px] text-white/90">{r.n}</span>
            <span className="ml-2 shrink-0 text-[10px] text-emerald-300/90">{r.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarketingPanel() {
  const [i, setI] = useState(0);
  const timer = useRef(null);
  const count = TESTIMONIALS.length;

  useEffect(() => {
    timer.current = setInterval(() => setI((p) => (p + 1) % count), 7000);
    return () => clearInterval(timer.current);
  }, [count]);

  const go = (next) => {
    setI(next);
    clearInterval(timer.current);
    timer.current = setInterval(() => setI((p) => (p + 1) % count), 7000);
  };

  const t = TESTIMONIALS[i];

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-indigo-950 px-8 py-10 text-white xl:px-12">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-indigo-600/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[360px] w-[360px] rounded-full bg-fuchsia-600/10 blur-[120px]" />

      <div className="relative">
        <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight xl:text-[2.5rem]">
          From first lead to booked meeting.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-indigo-200">
          Find prospects, run AI-assisted calls, automate outreach, and turn conversations into
          meetings — all from one platform.
        </p>

        <div className="mt-7 grid max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 transition-colors hover:bg-white/[0.07]"
              >
                <Icon size={18} className="text-indigo-300" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-semibold text-white">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-indigo-200/80">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative mt-8 max-w-lg">
        <ProductPreview />
      </div>

      <div className="relative mt-8 max-w-lg">
        <figure className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <blockquote className="text-[13px] leading-relaxed text-indigo-100">
            “{t.quote}”
          </blockquote>
          <figcaption className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 text-[11px] font-bold text-white"
                aria-hidden="true"
              >
                {t.initials}
              </span>
              <span className="text-xs leading-tight">
                <span className="block font-semibold text-white">{t.name}</span>
                <span className="text-indigo-300/80">
                  {t.role}, {t.company}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => go((i - 1 + count) % count)}
                aria-label="Previous testimonial"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go((i + 1) % count)}
                aria-label="Next testimonial"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
          </figcaption>
        </figure>
        <div className="mt-3 flex gap-1.5" role="tablist" aria-label="Testimonial">
          {TESTIMONIALS.map((item, idx) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={idx === i}
              aria-label={`Show testimonial ${idx + 1}`}
              onClick={() => go(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? 'w-6 bg-indigo-300' : 'w-1.5 bg-white/25 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
