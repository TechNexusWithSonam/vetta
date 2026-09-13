import { getMockOrganizations } from './organizations.mock.js';
import { mockListPlans } from './plans.mock.js';

function buildSubscriptions() {
  const orgs = getMockOrganizations();
  const plans = mockListPlans();
  return orgs.map((org) => {
    const plan = plans.find((p) => p.name === org.plan) || plans[0];
    return {
      id: `sub_${org.id}`,
      organizationId: org.id,
      organizationName: org.name,
      planId: plan.id,
      planName: plan.name,
      status: org.subscriptionStatus, // TRIAL | ACTIVE | PAST_DUE | CANCELLED | EXPIRED
      mrr: org.mrr,
      startedAt: org.createdAt,
      renewsAt: org.renewsAt,
      cancelAt: org.status === 'churned' ? org.renewsAt : null,
      paymentStatus: org.status === 'suspended' ? 'FAILED' : org.status === 'trial' ? 'N/A' : 'PAID',
    };
  });
}

export function mockListSubscriptions({ page = 1, limit = 10, search, status, planId } = {}) {
  let items = buildSubscriptions().filter((s) => {
    if (status && s.status !== status) return false;
    if (planId && s.planId !== planId) return false;
    if (search && !s.organizationName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const total = items.length;
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pageSize: limit };
}

export function mockGetSubscription(id) {
  const sub = buildSubscriptions().find((s) => s.id === id);
  if (!sub) throw new Error('Subscription not found');
  return sub;
}

export function mockSubscriptionOfOrganization(organizationId) {
  const sub = buildSubscriptions().find((s) => s.organizationId === organizationId);
  if (!sub) throw new Error('Subscription not found');
  return sub;
}

export function mockChangeSubscriptionPlan(id, planId) {
  const sub = mockGetSubscription(id);
  const plan = mockListPlans().find((p) => p.id === planId);
  return { ...sub, planId, planName: plan?.name || sub.planName };
}

export function mockCancelSubscription(id) {
  const sub = mockGetSubscription(id);
  return { ...sub, status: 'CANCELLED', cancelAt: new Date().toISOString() };
}
