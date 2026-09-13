import { mulberry32 } from './seed.js';
import { getMockOrganizations } from './organizations.mock.js';
import { mockBillingOverview } from './billing.mock.js';
import { getMockCalls } from './calls.mock.js';
import { getMockUsers } from './users.mock.js';

export function mockPlatformOverview() {
  const orgs = getMockOrganizations();
  const { totalRevenue, mrr } = mockBillingOverview();
  return {
    totalOrgs: orgs.length,
    activeOrgs: orgs.filter((o) => o.status === 'active').length,
    totalUsers: getMockUsers().length,
    totalCallsPlatform: getMockCalls().length,
    totalRevenue,
    mrr,
    growthPct: 8.4,
  };
}

function trend(days, seed, base, variance) {
  const rand = mulberry32(seed);
  let value = base;
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    value = Math.max(0, value + (rand() - 0.42) * variance);
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), value: Math.round(value) });
  }
  return out;
}

export function mockOrgGrowth() {
  return trend(30, 12, 18, 1.5).map((p) => ({ date: p.date, count: p.value }));
}

export function mockRevenueTrend() {
  return trend(30, 13, 24000, 900).map((p) => ({ date: p.date, revenue: p.value }));
}

export function mockChurnTrend() {
  return trend(30, 14, 3, 0.6).map((p) => ({ date: p.date, churned: p.value }));
}

export function mockCallVolumeTrend() {
  return trend(30, 15, 380, 60).map((p) => ({ date: p.date, calls: p.value }));
}

export function mockPlanDistribution() {
  const orgs = getMockOrganizations();
  const counts = {};
  for (const o of orgs) counts[o.plan] = (counts[o.plan] || 0) + 1;
  return Object.entries(counts).map(([plan, count]) => ({ plan, count }));
}
