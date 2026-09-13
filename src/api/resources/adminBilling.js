/** Admin — Billing & Payments `/admin/billing/*` (proposed contract). Never exposes raw card/payment-method data. */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import {
  mockBillingOverview, mockListInvoices, mockGetInvoice, mockRefundInvoice, mockListPayments,
} from '../../admin/mocks/billing.mock.js';

export const adminBilling = {
  overview: withMockFallback(
    (params) => http.get('/admin/billing/overview', { query: params }),
    () => mockBillingOverview(),
  ),
  invoices: {
    list: withMockFallback(
      (params) => http.get('/admin/billing/invoices', { query: params }),
      (params) => mockListInvoices(params),
    ),
    get: withMockFallback(
      (id) => http.get(`/admin/billing/invoices/${id}`),
      (id) => mockGetInvoice(id),
    ),
    refund: withMockFallback(
      (id, payload) => http.post(`/admin/billing/invoices/${id}/refund`, payload),
      (id, payload) => mockRefundInvoice(id, payload),
    ),
  },
  payments: {
    list: withMockFallback(
      (params) => http.get('/admin/billing/payments', { query: params }),
      (params) => mockListPayments(params),
    ),
  },
};

export default adminBilling;
