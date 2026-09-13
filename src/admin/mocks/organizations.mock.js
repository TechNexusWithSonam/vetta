import { seededArray, pick, randomInt, daysAgoIso, COMPANY_NAMES, FIRST_NAMES, LAST_NAMES, personEmail, companyDomain } from './seed.js';

const PLANS = ['Starter', 'Growth', 'Business', 'Scale'];
const STATUSES = ['active', 'trial', 'suspended', 'churned'];
const SUB_STATUSES = { active: 'ACTIVE', trial: 'TRIAL', suspended: 'PAST_DUE', churned: 'CANCELLED' };

let CACHE = null;

/** Stable, seeded list of mock organizations — the shared backbone every other mock module joins against. */
export function getMockOrganizations() {
  if (CACHE) return CACHE;
  CACHE = seededArray(COMPANY_NAMES.length, 42, (i, rand) => {
    const name = COMPANY_NAMES[i];
    const domain = companyDomain(name);
    const first = pick(rand, FIRST_NAMES);
    const last = pick(rand, LAST_NAMES);
    const status = i < 2 ? 'suspended' : i < 4 ? 'trial' : i === COMPANY_NAMES.length - 1 ? 'churned' : 'active';
    const plan = pick(rand, PLANS);
    const users = randomInt(rand, 2, 48);
    const mrr = status === 'trial' || status === 'churned' ? 0 : Math.round((plan === 'Starter' ? 49 : plan === 'Growth' ? 149 : plan === 'Business' ? 399 : 999) * (0.9 + rand() * 0.3));
    return {
      id: `org_${String(i + 1).padStart(3, '0')}`,
      name,
      domain,
      ownerName: `${first} ${last}`,
      ownerEmail: personEmail(first, last, domain),
      plan,
      status, // active | trial | suspended | churned
      subscriptionStatus: SUB_STATUSES[status],
      usersCount: users,
      mrr,
      totalCallsThisMonth: randomInt(rand, 20, 4200),
      creditsRemaining: randomInt(rand, 0, 10000),
      createdAt: daysAgoIso(rand, 540),
      renewsAt: new Date(Date.now() + randomInt(rand, -10, 40) * 86400000).toISOString(),
    };
  });
  return CACHE;
}

export function getMockOrganization(id) {
  return getMockOrganizations().find((o) => o.id === id) || null;
}

function matches(org, { search, status, plan }) {
  if (status && org.status !== status) return false;
  if (plan && org.plan !== plan) return false;
  if (search) {
    const q = search.toLowerCase();
    if (!org.name.toLowerCase().includes(q) && !org.ownerEmail.toLowerCase().includes(q)) return false;
  }
  return true;
}

export function mockListOrganizations({ page = 1, limit = 10, search, status, plan, sortBy = 'createdAt', sortDir = 'desc' } = {}) {
  let items = getMockOrganizations().filter((o) => matches(o, { search, status, plan }));
  items = [...items].sort((a, b) => {
    const av = a[sortBy], bv = b[sortBy];
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });
  const total = items.length;
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pageSize: limit };
}

export function mockGetOrganization(id) {
  const org = getMockOrganization(id);
  if (!org) throw new Error('Organization not found');
  return org;
}

export function mockMutateOrganization(id, patch) {
  const org = getMockOrganization(id);
  if (!org) throw new Error('Organization not found');
  Object.assign(org, patch);
  return org;
}

export function mockCreateOrganization(payload) {
  const list = getMockOrganizations();
  const org = {
    id: `org_${String(list.length + 1).padStart(3, '0')}`,
    name: payload.name || 'New organization',
    domain: companyDomain(payload.name || 'new-org'),
    ownerName: payload.ownerName || 'Unassigned',
    ownerEmail: payload.ownerEmail || '',
    plan: payload.plan || 'Starter',
    status: 'trial',
    subscriptionStatus: 'TRIAL',
    usersCount: 1,
    mrr: 0,
    totalCallsThisMonth: 0,
    creditsRemaining: 500,
    createdAt: new Date().toISOString(),
    renewsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
  };
  list.push(org);
  return org;
}

export function mockRemoveOrganization(id) {
  CACHE = getMockOrganizations().filter((o) => o.id !== id);
  return { id };
}
