/**
 * /resources — editorial index: featured piece, search, category filter, cards.
 * Content is sample editorial copy; wire to a CMS later.
 */

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Clock } from 'lucide-react';
import { Input, Card, Badge, cn } from '../../components/ui/index.js';
import { PageHero, Section } from '../components/layout.jsx';
import { RESOURCES } from '../content.js';

const CATEGORIES = ['All', 'Playbook', 'Guide'];

export default function Resources() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const featured = RESOURCES.find((r) => r.featured);
  const rest = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => !r.featured).filter((r) => {
      if (category !== 'All' && r.category !== category) return false;
      if (!q) return true;
      return `${r.title} ${r.excerpt} ${r.category}`.toLowerCase().includes(q);
    });
  }, [query, category]);

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Guides for teams building an autonomous outbound motion."
        lede="Playbooks, frameworks and field notes on research, AI calling and multi-channel sequences."
      />

      <Section size="sm">
        {featured && (
          <Card interactive className="grid gap-6 p-6 sm:grid-cols-[1.4fr_1fr] sm:p-8">
            <div>
              <Badge tone="brand">Featured · {featured.category}</Badge>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{featured.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{featured.excerpt}</p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                Read the playbook <ArrowRight size={15} aria-hidden="true" />
              </p>
            </div>
            <div className="hidden rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 sm:block" aria-hidden="true" />
          </Card>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            icon={Search}
            placeholder="Search resources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
            aria-label="Search resources"
          />
          <div className="flex gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold',
                  category === c
                    ? 'bg-brand-600 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((r) => (
            <Card key={r.title} interactive className="flex flex-col p-6">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <Badge tone="neutral">{r.category}</Badge>
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} /> {r.minutes} min
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{r.excerpt}</p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                Read <ArrowRight size={14} aria-hidden="true" />
              </p>
            </Card>
          ))}
        </div>
        {rest.length === 0 && (
          <p className="mt-10 text-center text-sm text-slate-400">Nothing matches that search yet.</p>
        )}
      </Section>

      <Section tone="subtle" size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Prefer to see it on your data?
          </h2>
          <p className="mt-3 text-slate-600">
            Start free, or have our team walk you through a build for your ICP.
          </p>
          <p className="mt-6 flex justify-center gap-4 text-sm font-semibold">
            <Link to="/signup" className="text-brand-600 hover:text-brand-700">
              Start for free
            </Link>
            <Link to="/contact" className="text-slate-600 hover:text-slate-900">
              Book a demo
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
