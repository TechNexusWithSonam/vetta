/**
 * /pricing — four plans, monthly/yearly toggle, a comparison matrix and an FAQ.
 * Prices are placeholders (see src/marketing/content.js → PLANS); swap the
 * numbers once commercial terms are set.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, ArrowRight } from 'lucide-react';
import { Button, Badge, cn } from '../../components/ui/index.js';
import { PageHero, Section } from '../components/layout.jsx';
import { FAQ } from '../components/bits.jsx';
import { PLANS, PRICING_MATRIX, FAQ_ITEMS } from '../content.js';

function price(plan, yearly) {
  if (plan.price) return plan.price;
  const value = yearly ? plan.priceYearly : plan.priceMonthly;
  return value === 0 ? 'Free' : `$${value.toLocaleString()}`;
}

export default function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple plans that scale with your volume."
        lede="Start free. Move up only when you need more calls, contacts or seats. No long forms to see a price."
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 text-sm font-semibold">
          <button
            onClick={() => setYearly(false)}
            className={cn('rounded-full px-4 py-1.5', !yearly ? 'bg-brand-600 text-white' : 'text-slate-600')}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={cn('rounded-full px-4 py-1.5', yearly ? 'bg-brand-600 text-white' : 'text-slate-600')}
          >
            Yearly
            <span className={cn('ml-1.5 text-xs', yearly ? 'text-brand-100' : 'text-emerald-600')}>−20%</span>
          </button>
        </div>
      </PageHero>

      <Section size="sm">
        <div className="grid gap-5 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'flex flex-col rounded-2xl border bg-white p-6',
                plan.popular ? 'border-brand-300 shadow-card-hover ring-1 ring-brand-200' : 'border-slate-200 shadow-card',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{plan.name}</h3>
                {plan.popular && <Badge tone="brand">Most popular</Badge>}
              </div>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {price(plan, yearly)}
                </span>
                {plan.unit && <span className="text-sm text-slate-400">{plan.unit}</span>}
              </p>
              <Button
                as={Link}
                to={plan.cta.to}
                className="mt-5"
                fullWidth
                variant={plan.popular ? 'primary' : 'secondary'}
              >
                {plan.cta.label}
              </Button>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Prices shown are placeholders pending final commercial terms.
        </p>
      </Section>

      <Section tone="subtle" title="Compare plans" size="sm" containerSize="wide">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-1/3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500" />
                  {PLANS.map((p) => (
                    <th key={p.name} className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {PRICING_MATRIX.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 font-medium text-slate-700">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center text-slate-600">
                        {v === true ? (
                          <Check size={16} className="mx-auto text-emerald-600" aria-label="Included" />
                        ) : v === false ? (
                          <Minus size={16} className="mx-auto text-slate-300" aria-label="Not included" />
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
      </Section>

      <Section title="Pricing questions" size="sm">
        <FAQ items={FAQ_ITEMS} />
      </Section>

      <Section tone="brand" size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Start free today.
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
              Talk to sales
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
