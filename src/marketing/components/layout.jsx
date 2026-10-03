/**
 * Marketing layout primitives — the page rhythm every marketing route shares.
 *
 * `Container` caps line length and gutters. `Section` is a vertical band with an
 * optional centered heading block (eyebrow / title / lede). Keep marketing
 * pages composed from these so spacing stays consistent.
 */

import React from 'react';
import { cn } from '../../components/ui/index.js';

export function Container({ size = 'default', className = '', children, ...props }) {
  const max = size === 'wide' ? 'max-w-7xl' : size === 'narrow' ? 'max-w-3xl' : 'max-w-6xl';
  return (
    <div className={cn('mx-auto w-full px-5 sm:px-6 lg:px-8', max, className)} {...props}>
      {children}
    </div>
  );
}

export function Eyebrow({ className = '', children }) {
  return (
    <p
      className={cn(
        'text-xs font-bold uppercase tracking-[0.14em] text-brand-600',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({ eyebrow, title, lede, align = 'center', className = '', as }) {
  const Heading = as || 'h2';
  return (
    <div
      className={cn(
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left',
        className,
      )}
    >
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <Heading className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </Heading>
      {lede && <p className="mt-4 text-lg leading-relaxed text-slate-600">{lede}</p>}
    </div>
  );
}

export function Section({
  eyebrow,
  title,
  lede,
  align = 'center',
  tone = 'white',
  size = 'default',
  containerSize = 'default',
  id,
  className = '',
  headingClassName = '',
  children,
}) {
  const tones = {
    white: 'bg-white',
    subtle: 'bg-slate-50',
    brand: 'bg-brand-950 text-white',
    gradient: 'bg-gradient-to-b from-white to-slate-50',
  };
  const pad = size === 'sm' ? 'py-14 sm:py-16' : size === 'lg' ? 'py-24 sm:py-32' : 'py-20 sm:py-24';

  return (
    <section id={id} className={cn(tones[tone], pad, className)}>
      <Container size={containerSize}>
        {(eyebrow || title || lede) && (
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            lede={lede}
            align={align}
            className={cn((eyebrow || title || lede) && children ? 'mb-14' : '', headingClassName)}
          />
        )}
        {children}
      </Container>
    </section>
  );
}

/** Standard top-of-page hero for the marketing sub-routes. */
export function PageHero({ eyebrow, title, lede, children, align = 'center', className = '' }) {
  return (
    <section className={cn('bg-gradient-to-b from-brand-50/70 via-white to-white', className)}>
      <Container className="py-16 sm:py-20">
        <div className={cn(align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl')}>
          {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          {lede && (
            <p
              className={cn(
                'mt-5 text-lg leading-relaxed text-slate-600',
                align === 'center' && 'mx-auto max-w-2xl',
              )}
            >
              {lede}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </Container>
    </section>
  );
}

export default Section;
