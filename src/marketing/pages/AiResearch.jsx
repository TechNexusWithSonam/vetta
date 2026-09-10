/**
 * /ai-research — the research capability in depth.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Database, Sparkles, ClipboardCheck } from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { Container, Eyebrow, PageHero, Section } from '../components/layout.jsx';
import { CTARow, FeatureGrid, FeatureCard, StepFlow } from '../components/bits.jsx';
import { ResearchPanelMock } from '../visuals/mocks.jsx';

const HOW = [
  { title: 'Find', description: 'Search by industry, size, geography and role to build a list that matches your ICP.', icon: Search },
  { title: 'Enrich', description: 'Every account gets firmographics, headcount, tech and contact detail — automatically.', icon: Database },
  { title: 'Analyze', description: 'Vetta reads funding, hiring and activity signals and scores account fit.', icon: Sparkles },
  { title: 'Prepare', description: 'You get talking points and a specific call angle for each prospect.', icon: ClipboardCheck },
];

export default function AiResearch() {
  return (
    <>
      <PageHero
        eyebrow="AI Research"
        title="Research prospects before your team ever calls."
        lede="Discovery, enrichment and signal analysis in one pass — so every dial opens with a real reason to be calling."
      >
        <CTARow align="center" primary={{ label: 'Find prospects', to: '/signup' }} />
      </PageHero>

      <Section size="sm">
        <div className="mx-auto max-w-3xl">
          <ResearchPanelMock />
        </div>
      </Section>

      <Section
        tone="subtle"
        eyebrow="What you get"
        title="From a name to a reason to call"
      >
        <FeatureGrid columns={3}>
          <FeatureCard icon={Search} title="Prospect discovery">
            Filter a universe of companies and people down to the accounts that look like your best
            customers.
          </FeatureCard>
          <FeatureCard icon={Database} title="Company research">
            Size, structure, locations and tech stack — pulled together so you are not tab-hopping.
          </FeatureCard>
          <FeatureCard icon={Sparkles} title="Funding & activity signals">
            Rounds, hiring surges, launches and leadership moves that make now the right time.
          </FeatureCard>
          <FeatureCard icon={ClipboardCheck} title="AI talking points">
            The two or three things worth raising on the call, drawn from the research.
          </FeatureCard>
          <FeatureCard icon={ArrowRight} title="Custom call angles">
            A specific opener per prospect, tied to a signal they would recognise.
          </FeatureCard>
          <FeatureCard icon={Database} title="Personalization data">
            Tokens ready for sequences so email and LinkedIn steps stay specific too.
          </FeatureCard>
        </FeatureGrid>
      </Section>

      <Section eyebrow="How AI Research works" title="Four steps, one pass">
        <StepFlow steps={HOW} />
      </Section>

      <Section tone="brand" size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Give every call a reason to exist.
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/signup" size="lg" iconRight={ArrowRight}>
              Find prospects
            </Button>
            <Button
              as={Link}
              to="/ai-calling"
              size="lg"
              variant="secondary"
              className="border-transparent bg-white/10 text-white hover:bg-white/20"
            >
              See AI Calling
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
