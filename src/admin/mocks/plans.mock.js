let CACHE = null;

function seedPlans() {
  return [
    {
      id: 'plan_starter',
      name: 'Starter',
      priceMonthly: 49,
      priceAnnual: 490,
      includedMinutes: 500,
      seats: 3,
      usageLimit: 1000,
      extraUsagePrice: 0.08,
      features: ['AI research', 'Basic call scripts', 'Email support'],
      trialDays: 14,
      isActive: true,
      estCogsPerSeat: 12,
    },
    {
      id: 'plan_growth',
      name: 'Growth',
      priceMonthly: 149,
      priceAnnual: 1490,
      includedMinutes: 2000,
      seats: 10,
      usageLimit: 5000,
      extraUsagePrice: 0.06,
      features: ['AI research', 'Advanced call scripts', 'CRM sync', 'Priority support'],
      trialDays: 14,
      isActive: true,
      estCogsPerSeat: 34,
    },
    {
      id: 'plan_business',
      name: 'Business',
      priceMonthly: 399,
      priceAnnual: 3990,
      includedMinutes: 8000,
      seats: 25,
      usageLimit: 20000,
      extraUsagePrice: 0.05,
      features: ['Everything in Growth', 'Custom qualification frameworks', 'Dedicated success manager'],
      trialDays: 7,
      isActive: true,
      estCogsPerSeat: 88,
    },
    {
      id: 'plan_scale',
      name: 'Scale',
      priceMonthly: 999,
      priceAnnual: 9990,
      includedMinutes: 30000,
      seats: 100,
      usageLimit: 100000,
      extraUsagePrice: 0.04,
      features: ['Everything in Business', 'SSO', 'Custom SLAs', 'White-glove onboarding'],
      trialDays: 0,
      isActive: true,
      estCogsPerSeat: 210,
    },
    {
      id: 'plan_legacy',
      name: 'Legacy Pro (archived)',
      priceMonthly: 199,
      priceAnnual: 1990,
      includedMinutes: 3000,
      seats: 15,
      usageLimit: 6000,
      extraUsagePrice: 0.07,
      features: ['Grandfathered pricing'],
      trialDays: 0,
      isActive: false,
      estCogsPerSeat: 40,
    },
  ];
}

function getPlans() {
  if (!CACHE) CACHE = seedPlans();
  return CACHE;
}

export function mockListPlans() {
  return getPlans();
}

export function mockGetPlan(id) {
  const plan = getPlans().find((p) => p.id === id);
  if (!plan) throw new Error('Plan not found');
  return plan;
}

export function mockCreatePlan(payload) {
  const plans = getPlans();
  const plan = {
    id: `plan_${Date.now()}`,
    features: [],
    trialDays: 14,
    isActive: true,
    estCogsPerSeat: 0,
    ...payload,
  };
  plans.push(plan);
  return plan;
}

export function mockUpdatePlan(id, patch) {
  const plan = mockGetPlan(id);
  Object.assign(plan, patch);
  return plan;
}

export function mockSetPlanActive(id, isActive) {
  return mockUpdatePlan(id, { isActive });
}
