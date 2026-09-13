import { seededArray, pick, daysAgoIso } from './seed.js';
import { getMockOrganizations } from './organizations.mock.js';

const STORAGE_KEY = 'vetta.admin.mock.auditLogs';

const SEED_ACTIONS = [
  'organization.suspend', 'organization.activate', 'organization.update', 'user.role_change',
  'plan.update', 'subscription.plan_change', 'billing.refund', 'usage.credits_adjust', 'cogs.category_update',
];

function seedLogs() {
  const orgs = getMockOrganizations();
  return seededArray(30, 88, (i, rand) => {
    const org = pick(rand, orgs);
    const action = pick(rand, SEED_ACTIONS);
    return {
      id: `audit_seed_${i + 1}`,
      at: daysAgoIso(rand, 45),
      actorId: 'system_seed',
      actorEmail: 'ops@vetta.ai',
      action,
      entityType: action.split('.')[0],
      entityId: org.id,
      organizationId: org.id,
      summary: `${action.replace('.', ' ').replace('_', ' ')} — ${org.name}`,
      metadata: {},
    };
  }).sort((a, b) => new Date(b.at) - new Date(a.at));
}

function loadStore() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* sessionStorage unavailable (SSR/private mode) — fall through to a fresh seed */
  }
  const seeded = seedLogs();
  persist(seeded);
  return seeded;
}

function persist(list) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* best-effort only */
  }
}

let CACHE = null;
function getStore() {
  if (!CACHE) CACHE = loadStore();
  return CACHE;
}

export function mockListAuditLogs({ page = 1, limit = 10, actorEmail, action, entityType, organizationId, from, to } = {}) {
  let items = getStore().filter((l) => {
    if (actorEmail && l.actorEmail !== actorEmail) return false;
    if (action && l.action !== action) return false;
    if (entityType && l.entityType !== entityType) return false;
    if (organizationId && l.organizationId !== organizationId) return false;
    if (from && new Date(l.at) < new Date(from)) return false;
    if (to && new Date(l.at) > new Date(to)) return false;
    return true;
  });
  const total = items.length;
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pageSize: limit };
}

export function mockCreateAuditLog(entry) {
  const record = {
    id: `audit_${Date.now()}_${Math.round(Math.random() * 1e4)}`,
    at: new Date().toISOString(),
    ...entry,
  };
  const store = getStore();
  store.unshift(record);
  persist(store);
  return record;
}
