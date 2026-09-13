import { mockBillingOverview } from './billing.mock.js';

let CATEGORIES = [
  { id: 'cogs_telephony', name: 'Telephony (Retell/Bland)', unitCost: 0.09, unit: 'per minute', provider: 'Retell + Bland', monthlyCost: 18400 },
  { id: 'cogs_ai', name: 'AI / LLM API', unitCost: 0.014, unit: 'per 1K tokens', provider: 'Anthropic/OpenAI', monthlyCost: 9200 },
  { id: 'cogs_hosting', name: 'Hosting (compute)', unitCost: 0, unit: 'flat/mo', provider: 'Vercel', monthlyCost: 1400 },
  { id: 'cogs_database', name: 'Database', unitCost: 0, unit: 'flat/mo', provider: 'Postgres (managed)', monthlyCost: 620 },
  { id: 'cogs_storage', name: 'Storage', unitCost: 0.023, unit: 'per GB', provider: 'S3', monthlyCost: 180 },
  { id: 'cogs_sms', name: 'SMS', unitCost: 0.0079, unit: 'per message', provider: 'Twilio', monthlyCost: 540 },
  { id: 'cogs_other', name: 'Other infrastructure', unitCost: 0, unit: 'flat/mo', provider: 'Misc', monthlyCost: 310 },
];

export function mockListCogsCategories() {
  return CATEGORIES;
}

export function mockUpdateCogsCategory(id, patch) {
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) throw new Error('Cost category not found');
  Object.assign(cat, patch);
  return cat;
}

export function mockCogsSummary() {
  const totalCost = CATEGORIES.reduce((s, c) => s + c.monthlyCost, 0);
  const { totalRevenue } = mockBillingOverview();
  const grossProfit = totalRevenue - totalCost;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  return {
    totalCost,
    totalRevenue,
    grossProfit,
    grossMarginPct,
    byCategory: CATEGORIES.map((c) => ({ category: c.name, cost: c.monthlyCost, pct: totalCost ? (c.monthlyCost / totalCost) * 100 : 0 })),
  };
}
