import { seededArray, randomInt } from './seed.js';
import { getMockOrganizations } from './organizations.mock.js';

export function mockUsageOverview() {
  const orgs = getMockOrganizations();
  const totalCalls = orgs.reduce((s, o) => s + o.totalCallsThisMonth, 0);
  return {
    totalCalls,
    totalMinutes: Math.round(totalCalls * 3.4),
    totalAiTokens: totalCalls * randomInt(() => 0.5, 800, 1600),
    totalCreditsConsumed: orgs.reduce((s, o) => s + Math.max(0, 5000 - o.creditsRemaining), 0),
  };
}

export function mockListUsage({ page = 1, limit = 10, organizationId } = {}) {
  let items = seededArray(getMockOrganizations().length, 55, (i, rand) => {
    const org = getMockOrganizations()[i];
    return {
      organizationId: org.id,
      organizationName: org.name,
      plan: org.plan,
      calls: org.totalCallsThisMonth,
      minutes: Math.round(org.totalCallsThisMonth * 3.4),
      aiTokens: org.totalCallsThisMonth * randomInt(rand, 800, 1600),
      creditsRemaining: org.creditsRemaining,
      creditsLimit: 10000,
      highUsage: org.creditsRemaining < 500,
    };
  });
  if (organizationId) items = items.filter((i) => i.organizationId === organizationId);
  const total = items.length;
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pageSize: limit };
}

export function mockUsageOfOrganization(organizationId) {
  const { items } = mockListUsage({ page: 1, limit: 1, organizationId });
  if (!items[0]) throw new Error('Organization not found');
  return items[0];
}

export function mockAdjustCredits(organizationId, { amount, reason } = {}) {
  const org = getMockOrganizations().find((o) => o.id === organizationId);
  if (!org) throw new Error('Organization not found');
  org.creditsRemaining = Math.max(0, org.creditsRemaining + Number(amount || 0));
  return { organizationId, creditsRemaining: org.creditsRemaining, reason: reason || '' };
}
