/**
 * /sequences — the multi-channel sequence builder in depth.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  Timer,
  GitBranch,
  Sparkles,
  OctagonMinus,
  MousePointerClick,
} from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { Eyebrow, PageHero, Section } from '../components/layout.jsx';
import { CTARow, FeatureGrid, FeatureCard } from '../components/bits.jsx';
import { SequenceBuilderMock } from '../visuals/mocks.jsx';

export default function Sequences() {
  return (
    <>
      <PageHero
        eyebrow="Sequences"
        title="Build outbound sequences that run themselves."
        lede="Call, email and LinkedIn in one flow — with delays, conditions, branches and follow-ups that fire on their own."
      >
        <CTARow align="center" primary={{ label: 'Create sequence', to: '/signup' }} />
      </PageHero>

      <Section size="sm">
        <div className="mx-auto max-w-3xl">
          <SequenceBuilderMock />
        </div>
      </Section>

      <Section tone="subtle" eyebrow="In the builder" title="Every step you need">
        <FeatureGrid columns={3}>
          <FeatureCard icon={MousePointerClick} title="Drag & reorder">
            Build the flow visually; move steps and the timing updates with them.
          </FeatureCard>
          <FeatureCard icon={Phone} title="Call steps">
            Drop an AI call anywhere in the sequence, with its own script and framework.
          </FeatureCard>
          <FeatureCard icon={Mail} title="Email steps">
            Personalized with research tokens; sent from your connected mailbox.
          </FeatureCard>
          <FeatureCard icon={MessageCircle} title="LinkedIn steps">
            Connection and message touches slotted between calls and emails.
          </FeatureCard>
          <FeatureCard icon={Timer} title="Wait & delay steps">
            Business-day aware waits so nothing lands at 2am on a Sunday.
          </FeatureCard>
          <FeatureCard icon={GitBranch} title="Conditions & branches">
            Split the path on reply, call outcome or CRM field.
          </FeatureCard>
          <FeatureCard icon={Sparkles} title="Personalization">
            Tokens from research and CRM, with fallbacks when a field is empty.
          </FeatureCard>
          <FeatureCard icon={OctagonMinus} title="Stop conditions">
            Auto-exit on reply, meeting booked, unsubscribe or a status change.
          </FeatureCard>
          <FeatureCard icon={ArrowRight} title="Automated follow-ups">
            The next touch is already scheduled — reps never chase a task list.
          </FeatureCard>
        </FeatureGrid>
      </Section>

      <Section eyebrow="The pattern" title="One flow, every channel">
        <ol className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-semibold text-slate-700">
          {['Call', 'Email', 'LinkedIn', 'Follow-up call', 'Meeting'].map((step, i, arr) => (
            <li key={step} className="flex items-center gap-3">
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5">{step}</span>
              {i < arr.length - 1 && <ArrowRight size={14} className="text-slate-300" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="brand" size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Set the flow once. Let it run.
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/signup" size="lg" iconRight={ArrowRight}>
              Create sequence
            </Button>
            <Button
              as={Link}
              to="/platform"
              size="lg"
              variant="secondary"
              className="border-transparent bg-white/10 text-white hover:bg-white/20"
            >
              See the platform
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
