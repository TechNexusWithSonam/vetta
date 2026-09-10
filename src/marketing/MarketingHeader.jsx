/**
 * Marketing site header — sticky, with a background/border/shadow transition
 * once the page is scrolled. Desktop: wordmark + grouped nav with dropdowns +
 * Log in / Get started. Mobile: wordmark + menu button + slide-down drawer.
 *
 * This is deliberately separate from the app's sidebar shell — marketing pages
 * never render the application navigation.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Menu, X, ShieldCheck } from 'lucide-react';
import { Button, cn } from '../components/ui/index.js';

const NAV = [
  {
    label: 'Platform',
    items: [
      { label: 'Platform overview', to: '/platform', desc: 'The full outbound engine' },
      { label: 'AI Research', to: '/ai-research', desc: 'Know who to call before you call' },
      { label: 'AI Calling', to: '/ai-calling', desc: 'Conversations at scale' },
      { label: 'Sequences', to: '/sequences', desc: 'One flow, every channel' },
      { label: 'Integrations', to: '/integrations', desc: 'CRM & calendar sync' },
    ],
  },
  {
    label: 'Solutions',
    items: [
      { label: 'Sales teams', to: '/platform' },
      { label: 'SDR teams', to: '/platform' },
      { label: 'RevOps', to: '/platform' },
      { label: 'Agencies', to: '/platform' },
      { label: 'Enterprise', to: '/contact' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Library', to: '/resources', desc: 'Guides, playbooks, blog' },
      { label: 'Case studies', to: '/case-studies', desc: 'Outcomes from real teams' },
      { label: 'Help center', to: '/resources' },
    ],
  },
  { label: 'Pricing', to: '/pricing' },
];

export function MarketingLogo({ className = '' }) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        className,
      )}
      aria-label="Vetta — home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-sm">
        <ShieldCheck size={18} className="text-white" aria-hidden="true" />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-slate-900">Vetta</span>
    </Link>
  );
}

function NavMenu({ entry }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openNow = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onFocus={openNow}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {entry.label}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <div className="vetta-menu-in absolute left-0 top-full z-40 w-72 pt-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-pop">
            {entry.items.map((item) => (
              <Link
                key={item.label + item.to}
                to={item.to}
                className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50"
              >
                <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                {item.desc && <span className="mt-0.5 block text-xs text-slate-500">{item.desc}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open. The drawer closes itself
  // on any nav click (see the panel's onClick), which covers route changes.
  useEffect(() => {
    if (!drawer) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [drawer]);

  const closeDrawer = () => setDrawer(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-200',
        scrolled || drawer
          ? 'border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur'
          : 'border-b border-transparent bg-white',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1">
          <MarketingLogo className="mr-4" />
          <nav className="hidden items-center lg:flex" aria-label="Primary">
            {NAV.map((entry) =>
              entry.items ? (
                <NavMenu key={entry.label} entry={entry} />
              ) : (
                <NavLink
                  key={entry.label}
                  to={entry.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-slate-900',
                      isActive ? 'text-slate-900' : 'text-slate-600',
                    )
                  }
                >
                  {entry.label}
                </NavLink>
              ),
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button as={Link} to="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button as={Link} to="/contact" variant="secondary" size="sm">
            Book a demo
          </Button>
          <Button as={Link} to="/signup" size="sm">
            Get started
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setDrawer((v) => !v)}
          aria-label={drawer ? 'Close menu' : 'Open menu'}
          aria-expanded={drawer}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
        >
          {drawer ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {drawer && (
        <div className="vetta-menu-in border-t border-slate-200 bg-white lg:hidden">
          <nav
            className="mx-auto max-w-6xl space-y-1 px-5 py-4 sm:px-6"
            aria-label="Mobile"
            onClick={(e) => {
              if (e.target.closest('a')) closeDrawer();
            }}
          >
            {NAV.flatMap((entry) =>
              entry.items
                ? [
                    <p
                      key={entry.label}
                      className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400"
                    >
                      {entry.label}
                    </p>,
                    ...entry.items.map((item) => (
                      <Link
                        key={entry.label + item.label + item.to}
                        to={item.to}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {item.label}
                      </Link>
                    )),
                  ]
                : [
                    <Link
                      key={entry.label}
                      to={entry.to}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      {entry.label}
                    </Link>,
                  ],
            )}
            <div className="grid gap-2 pt-4">
              <Button as={Link} to="/signup" fullWidth>
                Get started
              </Button>
              <Button as={Link} to="/login" variant="secondary" fullWidth>
                Log in
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
