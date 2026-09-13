import { getMockOrganizations } from './organizations.mock.js';
import { getMockUsers } from './users.mock.js';
import { getMockCalls } from './calls.mock.js';
import { mockBillingOverview } from './billing.mock.js';

export function mockDashboardSummary() {
  const orgs = getMockOrganizations();
  const { mrr } = mockBillingOverview();
  const today = new Date().toISOString().slice(0, 10);
  return {
    totalOrganizations: orgs.length,
    activeOrganizations: orgs.filter((o) => o.status === 'active').length,
    totalUsers: getMockUsers().length,
    mrr,
    totalCallsToday: getMockCalls().filter((c) => (c.createdAt || '').slice(0, 10) === today).length || 42,
    platformHealth: 'unknown', // filled in by the real api.system.health call, not this mock
  };
}
