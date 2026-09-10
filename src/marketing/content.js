/**
 * Shared marketing copy/data. Kept out of the components so the same lists feed
 * multiple pages (home teaser + dedicated page) without drifting.
 *
 * Everything here is marketing sample content — the metrics are illustrative and
 * explicitly labelled as such wherever they render. No real customer results.
 */

export const INTEGRATIONS = [
  { name: 'HubSpot', category: 'CRM', blurb: 'Two-way contact, company and deal sync.' },
  { name: 'Salesforce', category: 'CRM', blurb: 'Push activities, pull ownership and stages.' },
  { name: 'Google Calendar', category: 'Calendar', blurb: 'Real-time availability and instant booking.' },
  { name: 'Outlook Calendar', category: 'Calendar', blurb: 'Availability, holds and confirmations.' },
  { name: 'Pipedrive', category: 'CRM', blurb: 'Sync people, organisations and pipeline.' },
  { name: 'Slack', category: 'Notifications', blurb: 'Meeting-booked and hot-lead alerts.' },
  { name: 'Zapier', category: 'Automation', blurb: 'Fan events out to 6,000+ apps.' },
  { name: 'Webhooks', category: 'Automation', blurb: 'Signed event delivery to your stack.' },
];

export const TESTIMONIALS = [
  {
    quote:
      'We pointed Vetta at a stale list and had qualified meetings on the calendar the same week. It runs the top of funnel so our reps run conversations.',
    name: 'Jordan Ellis',
    role: 'VP Sales',
    company: 'Brightpath',
  },
  {
    quote:
      'The research is the part I did not expect. Every call opens with a real reason to be calling, and the connect rate shows it.',
    name: 'Priya Nadella',
    role: 'Head of SDR',
    company: 'Cadence Labs',
  },
  {
    quote:
      'One sequence covers call, email and LinkedIn with the follow-ups handled. Our RevOps team finally has a motion they can actually measure.',
    name: 'Marcus Webb',
    role: 'Director, RevOps',
    company: 'Northwind',
  },
];

/** Illustrative only — shown with a "sample data" label everywhere it renders. */
export const SAMPLE_METRICS = [
  { label: 'Calls completed / wk', value: '2,480' },
  { label: 'Live conversations', value: '612' },
  { label: 'Qualified leads', value: '188' },
  { label: 'Meetings booked', value: '54' },
];

export const FAQ_ITEMS = [
  {
    q: 'How does Vetta place calls?',
    a: 'Vetta dials from your connected numbers, detects live pickups vs. voicemail, and runs an AI conversation that qualifies the prospect. Positive calls can hand off to a rep or book a meeting directly.',
  },
  {
    q: 'Do I need to import my own leads?',
    a: 'You can import a list to start, or use AI Research to discover and enrich prospects that match your ICP. Most teams do both.',
  },
  {
    q: 'Which CRMs and calendars are supported?',
    a: 'HubSpot, Salesforce and Pipedrive for CRM; Google and Outlook for calendar. Slack, Zapier and signed webhooks cover everything else.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — the Starter plan is free to begin, no card required. You only move to a paid plan when you need more volume or seats.',
  },
  {
    q: 'How is usage billed?',
    a: 'Plans include a monthly allowance of calls, contacts and AI usage. Overages are metered and shown in your dashboard before they bill.',
  },
];

/** Placeholder pricing — replace `price` values once commercial terms are set. */
export const PLANS = [
  {
    name: 'Starter',
    tagline: 'Get your first meetings booked.',
    priceMonthly: 0,
    priceYearly: 0,
    unit: 'forever',
    cta: { label: 'Start for free', to: '/signup' },
    highlights: ['500 calls / mo', '1,000 contacts', '1 sequence', 'Core analytics', 'Email support'],
  },
  {
    name: 'Growth',
    tagline: 'Run a real outbound motion.',
    priceMonthly: 490,
    priceYearly: 390,
    unit: 'per mo',
    popular: true,
    cta: { label: 'Start free trial', to: '/signup' },
    highlights: [
      '5,000 calls / mo',
      '25,000 contacts',
      'Unlimited sequences',
      'Parallel dialing',
      'CRM + calendar sync',
      'Priority support',
    ],
  },
  {
    name: 'Business',
    tagline: 'Scale across the whole team.',
    priceMonthly: 1490,
    priceYearly: 1190,
    unit: 'per mo',
    cta: { label: 'Start free trial', to: '/signup' },
    highlights: [
      '20,000 calls / mo',
      '100,000 contacts',
      'Advanced routing & handoff',
      'Custom analytics',
      'SSO',
      'Dedicated CSM',
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'Security, scale and control.',
    price: 'Custom',
    unit: '',
    cta: { label: 'Talk to sales', to: '/contact' },
    highlights: [
      'Unlimited volume',
      'Custom data retention',
      'Dedicated infrastructure',
      'Security review & DPA',
      'Onboarding & enablement',
    ],
  },
];

export const PRICING_MATRIX = [
  { label: 'AI calls / month', values: ['500', '5,000', '20,000', 'Unlimited'] },
  { label: 'Contacts', values: ['1,000', '25,000', '100,000', 'Unlimited'] },
  { label: 'Sequences', values: ['1', 'Unlimited', 'Unlimited', 'Unlimited'] },
  { label: 'Parallel dialing', values: [false, true, true, true] },
  { label: 'CRM & calendar sync', values: [false, true, true, true] },
  { label: 'Advanced routing & handoff', values: [false, false, true, true] },
  { label: 'Analytics', values: ['Core', 'Full', 'Custom', 'Custom'] },
  { label: 'SSO', values: [false, false, true, true] },
  { label: 'Support', values: ['Email', 'Priority', 'Dedicated CSM', 'Dedicated CSM'] },
];

export const RESOURCES = [
  {
    title: 'The autonomous outbound playbook',
    category: 'Playbook',
    minutes: 12,
    excerpt: 'How to move from manual dialing to an AI-run top of funnel without losing the human touch.',
    featured: true,
  },
  {
    title: 'Writing call angles the AI can actually use',
    category: 'Guide',
    minutes: 7,
    excerpt: 'A framework for turning research signals into openers that earn the next 30 seconds.',
  },
  {
    title: 'Parallel dialing, explained',
    category: 'Guide',
    minutes: 5,
    excerpt: 'What parallel dialing is, when it helps, and how to keep it compliant.',
  },
  {
    title: 'Designing a multi-channel sequence',
    category: 'Playbook',
    minutes: 9,
    excerpt: 'Call, email and LinkedIn in one flow — timing, branching and stop conditions.',
  },
  {
    title: 'Qualification frameworks that survive contact',
    category: 'Guide',
    minutes: 8,
    excerpt: 'BANT, MEDDIC and lighter models — which to encode into your AI calls.',
  },
  {
    title: 'Handing off from AI to rep',
    category: 'Guide',
    minutes: 6,
    excerpt: 'The moments that matter and how to make the transfer feel seamless.',
  },
];

export const CASE_STUDIES = [
  {
    customer: 'Brightpath',
    industry: 'B2B SaaS',
    challenge: 'A two-person SDR team could not cover the inbound-adjacent outbound list.',
    solution: 'AI Research to prioritise the list, AI Calling to run first-touch, reps on qualified only.',
    result: 'Coverage of the full list within two weeks; reps spending their day in live conversations.',
  },
  {
    customer: 'Cadence Labs',
    industry: 'Developer tools',
    challenge: 'Low connect rates on a cold, technical audience.',
    solution: 'Research-driven call angles tied to public engineering signals; tighter list targeting.',
    result: 'A markedly higher share of dials reaching a live, relevant conversation.',
  },
  {
    customer: 'Northwind',
    industry: 'Logistics',
    challenge: 'RevOps had no measurable, repeatable outbound motion across regions.',
    solution: 'One multi-channel sequence per segment, CRM sync, analytics on every stage.',
    result: 'A single funnel view across regions and a motion the team can tune weekly.',
  },
];
