/**
 * /integrations — marketing view of the integration catalogue. Distinct from the
 * in-app /app/integrations page, which manages live connections.
 */

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ArrowLeftRight, CalendarClock, Webhook } from 'lucide-react';
import { Button, Input } from '../../components/ui/index.js';
import { Eyebrow, PageHero, Section } from '../components/layout.jsx';
import { CTARow, IntegrationCard, StepFlow } from '../components/bits.jsx';
import { INTEGRATIONS } from '../content.js';

const CATEGORIES = ['All', 'CRM', 'Calendar', 'Notifications', 'Automation'];

const SYNC_STEPS = [
  {
    title: 'Connect',
    description: 'Authorize your CRM and calendar in a few clicks. Vetta only requests the scopes it needs.',
    icon: ArrowLeftRight,
  },
  {
    title: 'Map',
    description: 'Choose which fields flow which way. Ownership and stages come in; activities and outcomes go out.',
    icon: CalendarClock,
  },
  {
    title: 'Sync',
    description: 'Changes propagate continuously. Meetings booked on a call appear on the calendar and in the CRM.',
    icon: Webhook,
  },
];

export default function Integrations() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTEGRATIONS.filter((it) => {
      if (category !== 'All' && it.category !== category) return false;
      if (!q) return true;
      return `${it.name} ${it.category} ${it.blurb}`.toLowerCase().includes(q);
    });
  }, [query, category]);

  return (
    <>
      <PageHero
        eyebrow="Integrations"
        title="Fits into the tools your team already uses."
        lede="Two-way CRM sync, real-time calendars, and events piped anywhere. Only the integrations Vetta actually supports are listed."
      >
        <CTARow align="center" />
      </PageHero>

      <Section size="sm">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              icon={Search}
              placeholder="Search integrations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:max-w-xs"
              aria-label="Search integrations"
            />
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={
                    category === c
                      ? 'rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white'
                      : 'rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50'
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {filtered.map((it) => (
              <IntegrationCard key={it.name} {...it} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-10 text-center text-sm text-slate-400">
              No integrations match that search.
            </p>
          )}
        </div>
      </Section>

      <Section tone="subtle" eyebrow="How syncing works" title="Vetta ↔ CRM ↔ Calendar">
        <StepFlow steps={SYNC_STEPS} />
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-slate-500">
          Manage live connections, field mappings and sync status from{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            your workspace
          </Link>
          .
        </p>
      </Section>

      <Section tone="brand" size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Keep your stack in sync.
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/signup" size="lg" iconRight={ArrowRight}>
              Start for free
            </Button>
            <Button
              as={Link}
              to="/contact"
              size="lg"
              variant="secondary"
              className="border-transparent bg-white/10 text-white hover:bg-white/20"
            >
              Ask about an integration
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
