/**
 * /case-studies — index of customer stories. Content is illustrative demo
 * material (names are fictional, no fabricated metrics); replace with real,
 * approved stories when available.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui/index.js';
import { Eyebrow, PageHero, Section } from '../components/layout.jsx';
import { Testimonials } from '../components/bits.jsx';
import { CASE_STUDIES, TESTIMONIALS } from '../content.js';

export default function CaseStudies() {
  return (
    <>
      <PageHero
        eyebrow="Case studies"
        title="How teams put Vetta to work."
        lede="Short stories about the change in motion — from manual dialing to an AI-run top of funnel."
      />

      <Section size="sm">
        <div className="grid gap-5 lg:grid-cols-3">
          {CASE_STUDIES.map((cs) => (
            <Card key={cs.customer} interactive className="flex flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">{cs.customer}</span>
                <Badge tone="neutral">{cs.industry}</Badge>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Challenge</dt>
                  <dd className="mt-0.5 text-slate-600">{cs.challenge}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Solution</dt>
                  <dd className="mt-0.5 text-slate-600">{cs.solution}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Result</dt>
                  <dd className="mt-0.5 text-slate-600">{cs.result}</dd>
                </div>
              </dl>
              <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                Read the story <ArrowRight size={14} aria-hidden="true" />
              </p>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Demo content — company names are fictional and no performance figures are claimed.
        </p>
      </Section>

      <Section tone="subtle" size="sm">
        <Eyebrow className="text-center">In their words</Eyebrow>
        <div className="mt-8">
          <Testimonials items={TESTIMONIALS} />
        </div>
      </Section>

      <Section tone="brand" size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Write your own before/after.
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
              Book a demo
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
