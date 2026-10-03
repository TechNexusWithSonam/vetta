/**
 * Reusable marketing content blocks. Small, composable, all built on the design
 * system so every marketing page reads as one product.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Minus, Plus, Star } from 'lucide-react';
import { Button, Card, cn } from '../../components/ui/index.js';

/** The standard primary/secondary CTA pair used across the site. */
export function CTARow({
  primary = { label: 'Start for free', to: '/signup' },
  secondary = { label: 'Book a demo', to: '/contact' },
  size = 'lg',
  align = 'start',
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row',
        align === 'center' && 'sm:justify-center',
        className,
      )}
    >
      {primary && (
        <Button as={Link} to={primary.to} size={size} iconRight={ArrowRight}>
          {primary.label}
        </Button>
      )}
      {secondary && (
        <Button as={Link} to={secondary.to} size={size} variant="secondary">
          {secondary.label}
        </Button>
      )}
    </div>
  );
}

/** Row of muted proof points under a hero. */
export function TrustBar({ items = [], label, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function IconTile({ icon, className = '' }) {
  const Icon = icon;
  return (
    <span
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100',
        className,
      )}
    >
      <Icon size={20} aria-hidden="true" />
    </span>
  );
}

export function FeatureCard({ icon, title, children, to, cta = 'Learn more', className = '' }) {
  return (
    <Card className={cn('flex flex-col p-6', className)} interactive={Boolean(to)}>
      {icon && <IconTile icon={icon} className="mb-4" />}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{children}</p>
      {to && (
        <Link
          to={to}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          {cta}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </Card>
  );
}

export function FeatureGrid({ columns = 3, className = '', children }) {
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' };
  return <div className={cn('grid gap-5', cols[columns], className)}>{children}</div>;
}

export function CheckList({ items = [], className = '', columns = 1 }) {
  return (
    <ul
      className={cn(
        'grid gap-3 text-sm text-slate-600',
        columns === 2 && 'sm:grid-cols-2',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check size={13} strokeWidth={3} aria-hidden="true" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Numbered workflow — the "Research → Call → Follow-up → Meeting" motif. */
export function StepFlow({ steps = [], className = '' }) {
  return (
    <ol className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {steps.map((step, i) => (
        <li key={step.title}>
          <Card className="h-full p-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold tabular-nums text-brand-600">
                {String(i + 1).padStart(2, '0')}
              </span>
              {step.icon && <step.icon size={18} className="text-slate-400" aria-hidden="true" />}
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.description}</p>
          </Card>
        </li>
      ))}
    </ol>
  );
}

/** Caption under a WorkflowRail — also the accessible description of that
 * (aria-hidden) visual. */
export function WorkflowRailNote({
  text = 'The flow runs left to right: each stage hands the next one what it needs.',
  className = '',
}) {
  return <p className={cn('mt-6 text-center text-sm text-slate-500', className)}>{text}</p>;
}

export function StatGrid({ stats = [], note, className = '' }) {
  return (
    <div className={className}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-6 text-center">
            <p className="text-3xl font-bold tracking-tight text-slate-900">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </Card>
        ))}
      </div>
      {note && <p className="mt-4 text-center text-xs text-slate-400">{note}</p>}
    </div>
  );
}

export function Testimonials({ items = [], className = '' }) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const active = items[index];
  return (
    <figure className={cn('mx-auto max-w-3xl text-center', className)}>
      <div className="mb-4 flex justify-center gap-1 text-amber-400" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
        ))}
      </div>
      <blockquote className="text-balance text-xl font-medium leading-relaxed text-slate-800 sm:text-2xl">
        “{active.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center justify-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {active.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')}
        </span>
        <span className="text-left text-sm">
          <span className="block font-semibold text-slate-900">{active.name}</span>
          <span className="block text-slate-500">
            {active.role}, {active.company}
          </span>
        </span>
      </figcaption>
      {items.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.name}
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial ${i + 1}`}
              aria-current={i === index || undefined}
              className={cn(
                'h-2 rounded-full transition-all',
                i === index ? 'w-6 bg-brand-600' : 'w-2 bg-slate-300 hover:bg-slate-400',
              )}
            />
          ))}
        </div>
      )}
    </figure>
  );
}

/** Letter tile that stands in for a third-party logo (no bundled brand assets). */
export function Monogram({ name, className = '' }) {
  return (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 ring-1 ring-inset ring-slate-200',
        className,
      )}
      aria-hidden="true"
    >
      {name.slice(0, 2)}
    </span>
  );
}

export function IntegrationCard({ name, category, blurb, status, className = '' }) {
  return (
    <Card className={cn('flex items-start gap-3.5 p-4', className)}>
      <Monogram name={name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
          {status ? (
            status
          ) : (
            <span className="shrink-0 text-[11px] font-medium text-slate-400">{category}</span>
          )}
        </div>
        {blurb && <p className="mt-1 text-xs leading-relaxed text-slate-500">{blurb}</p>}
      </div>
    </Card>
  );
}

export function FAQ({ items = [], className = '' }) {
  const [open, setOpen] = useState(0);
  return (
    <div className={cn('mx-auto max-w-3xl divide-y divide-slate-200 border-y border-slate-200', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-semibold text-slate-900"
              >
                {item.q}
                <span className="shrink-0 text-slate-400">
                  {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
            </h3>
            {isOpen && <p className="-mt-1 pb-5 pr-8 text-sm leading-relaxed text-slate-600">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default CTARow;
