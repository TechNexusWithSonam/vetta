import { seededArray, pick, randomInt, daysAgoIso } from './seed.js';
import { getMockOrganizations } from './organizations.mock.js';

export const CALL_STATUSES = [
  'QUEUED', 'INITIATING', 'RINGING', 'CONNECTED', 'IN_PROGRESS', 'COMPLETED',
  'FAILED', 'NO_ANSWER', 'BUSY', 'VOICEMAIL', 'CALLBACK_SCHEDULED', 'DO_NOT_CALL', 'CANCELLED',
];
const TERMINAL_WEIGHTED = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED', 'NO_ANSWER', 'BUSY', 'VOICEMAIL', 'CANCELLED'];
const PROVIDERS = ['retell', 'bland'];

let CACHE = null;

export function getMockCalls() {
  if (CACHE) return CACHE;
  const orgs = getMockOrganizations();
  CACHE = seededArray(240, 77, (i, rand) => {
    const org = pick(rand, orgs);
    const status = pick(rand, TERMINAL_WEIGHTED);
    const duration = status === 'COMPLETED' ? randomInt(rand, 20, 640) : status === 'IN_PROGRESS' ? randomInt(rand, 5, 300) : 0;
    return {
      id: `call_${String(i + 1).padStart(5, '0')}`,
      organizationId: org.id,
      organizationName: org.name,
      leadId: `lead_${randomInt(rand, 1000, 9999)}`,
      campaignId: rand() > 0.2 ? `camp_${randomInt(rand, 100, 999)}` : null,
      toPhoneNumber: `+1415${randomInt(rand, 1000000, 9999999)}`,
      status,
      provider: pick(rand, PROVIDERS),
      durationSeconds: duration,
      costUsd: duration ? +(duration * 0.012).toFixed(2) : 0,
      meetingBooked: status === 'COMPLETED' && rand() > 0.7,
      converted: status === 'COMPLETED' && rand() > 0.85,
      createdAt: daysAgoIso(rand, 30),
      startedAt: daysAgoIso(rand, 30),
      endedAt: status === 'COMPLETED' || status === 'FAILED' ? daysAgoIso(rand, 30) : null,
    };
  });
  return CACHE;
}

export function mockListCalls({ page = 1, limit = 10, status, organizationId, campaignId } = {}) {
  let items = getMockCalls().filter((c) => {
    if (status && c.status !== status) return false;
    if (organizationId && c.organizationId !== organizationId) return false;
    if (campaignId && c.campaignId !== campaignId) return false;
    return true;
  });
  items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = items.length;
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pageSize: limit };
}

export function mockGetCall(id) {
  const call = getMockCalls().find((c) => c.id === id);
  if (!call) throw new Error('Call not found');
  return call;
}

export function mockCallsOfOrganization(organizationId, { page = 1, limit = 10 } = {}) {
  return mockListCalls({ page, limit, organizationId });
}
