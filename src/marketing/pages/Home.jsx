/**
 * / — landing page. Communicates the whole motion in order:
 * Research → Call → Follow-up → Meeting.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Building2,
  Radar,
  PhoneOutgoing,
  MessagesSquare,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
  PlugZap,
  BarChart3,
} from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { Container, Eyebrow, Section } from '../components/layout.jsx';
import {
  CTARow,
  TrustBar,
  FeatureGrid,
  FeatureCard,
  CheckList,
  StatGrid,
  Testimonials,
  IntegrationCard,
} from '../components/bits.jsx';
import {
  DashboardMock,
  CallConsoleMock,
  ResearchPanelMock,
  SequenceBuilderMock,
  WorkflowRail,
} from '../visuals/mocks.jsx';
import { INTEGRATIONS, TESTIMONIALS, SAMPLE_METRICS } from '../content.js';

const WORKFLOW = [
  { label: 'Find prospects', hint: 'ICP search & lists', icon: Search },
  { label: 'Research accounts', hint: 'Firmographics & signals', icon: Building2 },
  { label: 'Launch AI calls', hint: 'Parallel dialing', icon: PhoneOutgoing },
  { label: 'Qualify conversations', hint: 'Framework-driven', icon: MessagesSquare },
  { label: 'Automate follow-ups', hint: 'Every channel', icon: Radar },
  { label: 'Book meetings', hint: 'Straight to calendar', icon: CalendarCheck },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
        <Container className="pb-16 pt-16 sm:pb-20 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow className="mb-4">Autonomous sales platform</Eyebrow>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              From first lead to booked meeting.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              Find prospects, research accounts, run AI-powered conversations, automate follow-ups,
              and book qualified meetings — all from one autonomous sales platform.
            </p>
            <CTARow className="mt-8" align="center" primary={{ label: 'Start for free', to: '/signup' }} />
          </div>

          <div className="mx-auto mt-14 max-w-4xl">
            <DashboardMock />
          </div>

          <TrustBar
            className="mt-10 items-center text-center"
            label="Built for outbound teams that care about"
            items={['Connect rate', 'Conversation quality', 'Meetings booked', 'Clean CRM data']}
          />
        </Container>
      </section>

      {/* Product workflow */}
      <Section
        tone="subtle"
        eyebrow="The motion"
        title="Your entire outbound workflow, automated."
        lede="Six steps, one platform. Each stage feeds the next so nothing stalls in a spreadsheet."
      >
        <WorkflowRail steps={WORKFLOW} />
        <p className="mt-8 text-center">
          <Link
            to="/platform"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            See how the platform fits together
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </p>
      </Section>

      {/* AI Research */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-3">AI Research</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Know who to call before you call.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Vetta discovers prospects that match your ICP, enriches every account, and turns the
              signals into a reason to pick up the phone.
            </p>
            <CheckList
              className="mt-6"
              columns={2}
              items={[
                'Prospect discovery',
                'Company & firmographics',
                'Funding & hiring signals',
                'Recent activity & news',
                'AI-generated talking points',
                'Custom call angles',
              ]}
            />
            <Button as={Link} to="/ai-research" className="mt-8" variant="secondary" iconRight={ArrowRight}>
              Explore AI Research
            </Button>
          </div>
          <ResearchPanelMock />
        </div>
      </Section>

      {/* AI Calling */}
      <Section tone="subtle">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="lg:order-2">
            <Eyebrow className="mb-3">AI Calling</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              AI that actually talks to your prospects.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Natural AI voice, parallel dialing, live-pickup handling, qualification and a clean
              handoff to a rep — with a transcript and outcome on every call.
            </p>
            <CheckList
              className="mt-6"
              columns={2}
              items={[
                'AI voice conversations',
                'Parallel dialing',
                'Voicemail detection',
                'Objection handling',
                'Human handoff & routing',
                'Transcripts & outcomes',
              ]}
            />
            <Button as={Link} to="/ai-calling" className="mt-8" variant="secondary" iconRight={ArrowRight}>
              Explore AI Calling
            </Button>
          </div>
          <div className="lg:order-1">
            <CallConsoleMock />
          </div>
        </div>
      </Section>

      {/* Multi-channel sequences */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-3">Sequences</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              One sequence. Every channel.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Build a flow across call, email and LinkedIn with delays, conditions and branches.
              Follow-ups fire on their own; stop conditions keep it clean.
            </p>
            <CheckList
              className="mt-6"
              columns={2}
              items={[
                'Drag-to-reorder steps',
                'Wait & delay steps',
                'Conditions & branches',
                'Personalization tokens',
                'Automated follow-ups',
                'Stop conditions',
              ]}
            />
            <Button as={Link} to="/sequences" className="mt-8" variant="secondary" iconRight={ArrowRight}>
              Build a sequence
            </Button>
          </div>
          <SequenceBuilderMock />
        </div>
      </Section>

      {/* Integrations */}
      <Section
        tone="subtle"
        eyebrow="Integrations"
        title="Fits into the tools your team already uses."
        lede="Two-way CRM sync, real-time calendars, and events piped anywhere you need them."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATIONS.slice(0, 8).map((it) => (
            <IntegrationCard key={it.name} {...it} />
          ))}
        </div>
        <p className="mt-8 text-center">
          <Button as={Link} to="/integrations" variant="secondary" iconRight={ArrowRight}>
            View integrations
          </Button>
        </p>
      </Section>

      {/* Analytics / results */}
      <Section
        eyebrow="Results"
        title="Every stage of the funnel, measured."
        lede="Connect rate, conversation rate, qualified rate and meetings — by campaign, sequence and rep."
      >
        <StatGrid stats={SAMPLE_METRICS} note="Sample data shown for illustration — not a customer result." />
        <div className="mt-6">
          <FeatureGrid columns={3}>
            <FeatureCard icon={BarChart3} title="Conversion funnel">
              Watch leads move from researched to called to qualified to booked, with drop-off at
              every step.
            </FeatureCard>
            <FeatureCard icon={PlugZap} title="Campaign performance">
              Compare campaigns and sequences side by side — volume, connect rate and meeting rate.
            </FeatureCard>
            <FeatureCard icon={ShieldCheck} title="Clean CRM data">
              Outcomes, notes and next steps written back automatically, so the CRM reflects reality.
            </FeatureCard>
          </FeatureGrid>
        </div>
      </Section>

      {/* Testimonials */}
      <Section tone="subtle" size="sm">
        <Testimonials items={TESTIMONIALS} />
      </Section>

      {/* Final CTA */}
      <Section tone="brand">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Turn your outbound motion into an autonomous sales engine.
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            Start free. Connect your CRM and calendar. Book your first AI-sourced meeting this week.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/signup" size="lg" iconRight={ArrowRight}>
              Start for free
            </Button>
            <Button
              as={Link}
              to="/contact"
              size="lg"
              variant="secondary"
              className="border-transparent bg-white/10 text-white hover:bg-white/20 hover:border-transparent"
            >
              Book a demo
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
