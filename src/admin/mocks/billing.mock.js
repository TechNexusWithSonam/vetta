import { seededArray, pick, daysAgoIso } from './seed.js';
import { getMockOrganizations } from './organizations.mock.js';

const INVOICE_STATUSES = ['paid', 'paid', 'paid', 'open', 'failed', 'refunded'];

let CACHE = null;

function getInvoices() {
  if (CACHE) return CACHE;
  const orgs = getMockOrganizations();
  CACHE = seededArray(90, 91, (i, rand) => {
    const org = pick(rand, orgs.filter((o) => o.status !== 'trial'));
    if (!org) return null;
    const amount = Math.round((org.mrr || 149) * (0.95 + rand() * 0.1));
    return {
      id: `inv_${String(i + 1).padStart(4, '0')}`,
      organizationId: org.id,
      organizationName: org.name,
      amount,
      status: pick(rand, INVOICE_STATUSES),
      issuedAt: daysAgoIso(rand, 90),
      paidAt: daysAgoIso(rand, 90),
    };
  }).filter(Boolean);
  return CACHE;
}

export function mockBillingOverview() {
  const invoices = getInvoices();
  const paid = invoices.filter((i) => i.status === 'paid');
  const failed = invoices.filter((i) => i.status === 'failed');
  const refunded = invoices.filter((i) => i.status === 'refunded');
  const totalRevenue = paid.reduce((s, i) => s + i.amount, 0);
  const orgs = getMockOrganizations();
  const mrr = orgs.reduce((s, o) => s + (o.mrr || 0), 0);
  return {
    mrr,
    arr: mrr * 12,
    totalRevenue,
    outstandingInvoices: invoices.filter((i) => i.status === 'open').length,
    failedPayments: failed.length,
    refundsIssued: refunded.length,
  };
}

export function mockListInvoices({ page = 1, limit = 10, status, organizationId } = {}) {
  let items = getInvoices().filter((i) => {
    if (status && i.status !== status) return false;
    if (organizationId && i.organizationId !== organizationId) return false;
    return true;
  });
  items = [...items].sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  const total = items.length;
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pageSize: limit };
}

export function mockGetInvoice(id) {
  const inv = getInvoices().find((i) => i.id === id);
  if (!inv) throw new Error('Invoice not found');
  return inv;
}

export function mockRefundInvoice(id, { amount, reason } = {}) {
  const inv = mockGetInvoice(id);
  inv.status = 'refunded';
  inv.refundAmount = amount ?? inv.amount;
  inv.refundReason = reason || '';
  return inv;
}

export function mockListPayments({ page = 1, limit = 10, status } = {}) {
  return mockListInvoices({ page, limit, status });
}

export function mockBillingOfOrganization(organizationId, { page = 1, limit = 10 } = {}) {
  return mockListInvoices({ page, limit, organizationId });
}
