/**
 * Shared shell for every authentication screen.
 *
 * - Minimal header: Vetta wordmark on the left, one contextual link on the
 *   right (no marketing nav).
 * - Left: the form column (`children`), always full-width on mobile.
 * - Right: the product panel, shown only from `lg` up. Pages that don't want it
 *   (verification, onboarding) pass `panel={false}` for a centred single column.
 * - No horizontal scroll at any width; the form column scrolls internally.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import MarketingPanel from './MarketingPanel.jsx';

export function AuthLogo({ className = '' }) {
  return (
    <Link
      to="/login"
      className={`inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${className}`}
      aria-label="Vetta — go to sign in"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
        <ShieldCheck size={20} className="text-white" aria-hidden="true" />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-slate-900">Vetta</span>
    </Link>
  );
}

/**
 * @param {object} props
 * @param {React.ReactNode} props.children              Form column content.
 * @param {boolean} [props.panel=true]                  Show the product panel (lg+).
 * @param {{ prompt: string, label: string, to: string }} [props.headerCta]
 * @param {'md'|'lg'} [props.width='md']                Form column max width.
 */
export default function AuthLayout({ children, panel = true, headerCta, width = 'md' }) {
  const formMax = width === 'lg' ? 'max-w-lg' : 'max-w-md';

  return (
    <div className="flex min-h-svh w-full flex-col bg-white font-sans text-slate-900">
      <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5 sm:px-8">
        <AuthLogo />
        {headerCta && (
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <span className="hidden sm:inline">{headerCta.prompt}</span>
            <Link
              to={headerCta.to}
              className="rounded font-semibold text-indigo-600 transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {headerCta.label}
            </Link>
          </p>
        )}
      </header>

      <div className={`grid flex-1 ${panel ? 'lg:grid-cols-[1fr_minmax(440px,44%)]' : ''}`}>
        <main className="flex flex-1 items-start justify-center overflow-y-auto px-5 py-10 sm:px-8 sm:py-14">
          <div className={`vetta-fade-in w-full ${formMax}`}>{children}</div>
        </main>

        {panel && (
          <aside className="hidden lg:block">
            <MarketingPanel />
          </aside>
        )}
      </div>
    </div>
  );
}

/** Standard page heading used at the top of each form column. */
export function AuthHeading({ title, subtitle }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
    </div>
  );
}

/** Bottom-of-form legal line with real links. */
export function AuthLegal() {
  return (
    <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
      By continuing, you agree to Vetta&rsquo;s{' '}
      <a
        href="/legal/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
      >
        Terms of Service
      </a>{' '}
      and{' '}
      <a
        href="/legal/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
      >
        Privacy Policy
      </a>
      .
    </p>
  );
}
