/**
 * Marketing site footer — product / solutions / resources / company columns,
 * social links, legal line. Links point at real marketing routes; the few
 * pages that don't exist yet resolve to the closest page rather than 404.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'AI Research', to: '/ai-research' },
      { label: 'AI Calling', to: '/ai-calling' },
      { label: 'Sequences', to: '/sequences' },
      { label: 'Analytics', to: '/platform' },
      { label: 'Integrations', to: '/integrations' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Sales teams', to: '/platform' },
      { label: 'SDR teams', to: '/platform' },
      { label: 'RevOps', to: '/platform' },
      { label: 'Agencies', to: '/platform' },
      { label: 'Enterprise', to: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', to: '/resources' },
      { label: 'Guides', to: '/resources' },
      { label: 'Case studies', to: '/case-studies' },
      { label: 'Help center', to: '/resources' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/platform' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '/contact' },
      { label: 'Privacy', to: '/legal/privacy', external: true },
      { label: 'Terms', to: '/legal/terms', external: true },
    ],
  },
];

const SOCIAL = [
  { label: 'LinkedIn', mark: 'in', href: 'https://www.linkedin.com' },
  { label: 'X', mark: 'X', href: 'https://x.com' },
  { label: 'GitHub', mark: 'GH', href: 'https://github.com' },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Vetta — home">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <ShieldCheck size={18} className="text-white" aria-hidden="true" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">Vetta</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              The autonomous sales platform — from first lead to booked meeting.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800"
                >
                  {s.mark}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Vetta, Inc. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <a href="/legal/privacy" className="hover:text-slate-600">Privacy</a>
            <a href="/legal/terms" className="hover:text-slate-600">Terms</a>
            <a href="/legal/security" className="hover:text-slate-600">Security</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
