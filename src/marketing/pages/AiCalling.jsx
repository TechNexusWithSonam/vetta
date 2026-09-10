/**
 * /ai-calling — the calling capability in depth.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  PhoneCall,
  Users,
  Voicemail,
  ShieldQuestion,
  Share2,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { Eyebrow, PageHero, Section } from '../components/layout.jsx';
import { CTARow, FeatureGrid, FeatureCard, StepFlow, StatGrid } from '../components/bits.jsx';
import { CallConsoleMock } from '../visuals/mocks.jsx';
import { SAMPLE_METRICS } from '../content.js';

const HOW = [
  { title: 'Dial', description: 'Parallel dialing works a list fast, from your connected numbers.' },
  { title: 'Connect', description: 'Live-pickup detection routes real humans in and skips voicemail.' },
  { title: 'Converse', description: 'Natural AI voice runs the opener, handles objections and stays on script.' },
  { title: 'Qualify', description: 'Your framework — BANT, MEDDIC or custom — decides what counts.' },
  { title: 'Route', description: 'Qualified calls hand off to a rep or drop into follow-up.' },
  { title: 'Follow up', description: 'Every call ends with an outcome, a transcript and a next step.' },
];

export default function AiCalling() {
  return (
    <>
      <PageHero
        eyebrow="AI Calling"
        title="AI-powered conversations at scale."
        lede="Parallel dialing, live-pickup handling, qualification and human handoff — with a transcript and outcome on every call."
      >
        <CTARow align="center" primary={{ label: 'Start for free', to: '/signup' }} />
      </PageHero>

      <Section size="sm">
        <div className="mx-auto max-w-3xl">
          <CallConsoleMock />
        </div>
      </Section>

      <Section tone="subtle" eyebrow="Capabilities" title="Everything a first-touch call needs">
        <FeatureGrid columns={3}>
          <FeatureCard icon={PhoneCall} title="Natural AI voice">
            Conversational, interruptible and on-message — not a rigid IVR.
          </FeatureCard>
          <FeatureCard icon={Users} title="Parallel dialing">
            Multiple lines at once so reps only ever touch a live conversation.
          </FeatureCard>
          <FeatureCard icon={Voicemail} title="Live pickup detection">
            Humans get the pitch; answering machines get skipped or a drop.
          </FeatureCard>
          <FeatureCard icon={ShieldQuestion} title="Objection handling">
            Common pushback handled inline, with fallbacks you configure.
          </FeatureCard>
          <FeatureCard icon={Share2} title="Routing & human handoff">
            Warm-transfer a qualified prospect to the right rep in seconds.
          </FeatureCard>
          <FeatureCard icon={FileText} title="Transcripts & outcomes">
            A summary, a disposition and a next action written back to the CRM.
          </FeatureCard>
        </FeatureGrid>
      </Section>

      <Section eyebrow="How a call works" title="Dial to done">
        <StepFlow steps={HOW} />
      </Section>

      <Section tone="subtle" size="sm" eyebrow="On the dashboard" title="What you watch while it runs">
        <StatGrid
          stats={[
            { label: 'Active calls', value: '18' },
            ...SAMPLE_METRICS.slice(1),
          ]}
          note="Sample data shown for illustration — not a customer result."
        />
      </Section>

      <Section tone="brand" size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Put your reps on live conversations only.
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
