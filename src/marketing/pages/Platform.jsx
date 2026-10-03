/**
 * /platform — the whole engine on one page. Each capability gets an explanation,
 * a visual, benefits and a link to its dedicated page.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  PhoneOutgoing,
  Workflow,
  Database,
  CalendarClock,
  LineChart,
} from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { Container, Eyebrow, PageHero, Section } from '../components/layout.jsx';
import { CTARow, CheckList, WorkflowRailNote } from '../components/bits.jsx';
import {
  DashboardMock,
  CallConsoleMock,
  ResearchPanelMock,
  SequenceBuilderMock,
  WorkflowRail,
} from '../visuals/mocks.jsx';

const STEPS = [
  { label: 'Research', hint: 'Discover & enrich', icon: Building2 },
  { label: 'Call', hint: 'AI conversations', icon: PhoneOutgoing },
  { label: 'Sequence', hint: 'Every channel', icon: Workflow },
  { label: 'CRM', hint: 'Two-way sync', icon: Database },
  { label: 'Calendar', hint: 'Instant booking', icon: CalendarClock },
  { label: 'Analytics', hint: 'Full funnel', icon: LineChart },
];

const CAPABILITIES = [
  {
    eyebrow: 'Research',
    title: 'Build a target list worth calling',
    copy: 'Discover prospects that match your ICP, enrich every account, and generate the call angle before the first dial.',
    benefits: ['ICP search & lists', 'Firmographics & signals', 'AI call angles'],
    to: '/ai-research',
    visual: <ResearchPanelMock />,
  },
  {
    eyebrow: 'Calling',
    title: 'Run first-touch conversations at scale',
    copy: 'Parallel dialing with live-pickup detection, an AI conversation that qualifies, and a clean handoff to a rep.',
    benefits: ['Parallel dialing', 'Qualification frameworks', 'Human handoff & routing'],
    to: '/ai-calling',
    visual: <CallConsoleMock />,
  },
  {
    eyebrow: 'Sequences',
    title: 'Keep every prospect moving',
    copy: 'One flow across call, email and LinkedIn with delays, branches and automated follow-ups.',
    benefits: ['Conditions & branches', 'Personalization', 'Stop conditions'],
    to: '/sequences',
    visual: <SequenceBuilderMock />,
  },
];

export default function Platform() {
  return (
    <>
      <PageHero
        eyebrow="Platform"
        title="One platform for your entire outbound engine."
        lede="Research, calling, sequences, CRM, calendar and analytics — connected, so a lead never falls between tools."
      >
        <CTARow align="center" />
      </PageHero>

      <Section tone="subtle" size="sm">
        <WorkflowRail steps={STEPS} />
        <WorkflowRailNote />
      </Section>

      <Section size="sm">
        <div className="mx-auto max-w-4xl">
          <DashboardMock />
        </div>
      </Section>

      {CAPABILITIES.map((cap, i) => (
        <Section key={cap.eyebrow} tone={i % 2 === 1 ? 'subtle' : 'white'}>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
              <Eyebrow className="mb-3">{cap.eyebrow}</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">{cap.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{cap.copy}</p>
              <CheckList className="mt-6" items={cap.benefits} />
              <Button as={Link} to={cap.to} className="mt-8" variant="secondary" iconRight={ArrowRight}>
                Learn more
              </Button>
            </div>
            <div className={i % 2 === 1 ? 'lg:order-1' : ''}>{cap.visual}</div>
          </div>
        </Section>
      ))}

      <Section
        eyebrow="CRM & Calendar"
        title="Your systems stay in sync"
        lede="Vetta reads ownership and stages from your CRM, writes activities and outcomes back, and books into real calendar availability."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <Database className="text-brand-600" size={20} aria-hidden="true" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">CRM synchronization</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Two-way sync for contacts, companies and deals with HubSpot, Salesforce and Pipedrive.
              Field mappings you control.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <CalendarClock className="text-brand-600" size={20} aria-hidden="true" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">Calendar synchronization</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Google and Outlook availability, working hours and holidays respected. Meetings booked
              on the call land on the calendar instantly.
            </p>
          </div>
        </div>
        <p className="mt-8">
          <Link
            to="/integrations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            See all integrations
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </p>
      </Section>

      <Section tone="brand" size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            See the whole engine on your data.
          </h2>
          <p className="mt-4 text-lg text-brand-100">Start free, or walk through it with our team.</p>
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
