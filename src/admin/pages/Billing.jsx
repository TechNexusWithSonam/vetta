import { useMemo, useState } from 'react';
import { DollarSign, Clock, XCircle, RotateCcw, Plus } from 'lucide-react';
import { api } from '../../api';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { useDebounced } from '../lib/useDebounced.js';
import { rangeParams, RANGE_SELECT_OPTIONS } from '../lib/dateRange.js';
import { cleanParams, currency, label, shortId } from '../lib/format.js';
import {
  SectionHeader, StatCard, DataTable, FilterBar, StatusBadge, RecordPaymentModal, RefundPaymentModal, PaymentDetailModal,
} from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import { Button, Select } from '../../components/ui';
import { dateTime, num } from '../../lib/format';

const STATUS_OPTIONS = ['SUCCEEDED', 'PENDING', 'FAILED', 'REFUNDED'].map((s) => ({ value: s, label: label(s) }));
const PROVIDER_OPTIONS = ['MANUAL', 'STRIPE', 'RAZORPAY', 'PAYPAL'].map((s) => ({ value: s, label: label(s) }));

export default function AdminBilling() {
  const { can } = useAdminAccess();
  const canManage = can(P.BILLING_MANAGE);
  const [rangeKey, setRangeKey] = useState('30d');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type, row? }
  const limit = 10;
  const debouncedSearch = useDebounced(search);
  const range = rangeParams(rangeKey);

  const overview = useAdminQuery((signal) => api.admin.billing.overview(range, { signal }), [rangeKey]);
  const query = useMemo(
    () => cleanParams({ page, limit, search: debouncedSearch.trim(), status, provider, ...range }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `range` is derived from rangeKey
    [page, debouncedSearch, status, provider, rangeKey],
  );
  const payments = useAdminQuery((signal) => api.admin.billing.payments.list(query, { signal }), [query]);
  const o = overview.data || {};
  const stat = { loading: overview.loading, error: overview.error };
  const resetPage = (fn) => (v) => { fn(v); setPage(1); };
  const reloadAll = () => { setModal(null); payments.reload(); overview.reload(); };

  const columns = [
    { key: 'id', header: 'Payment', render: (p) => <code className="text-xs">{shortId(p.id)}</code> },
    { key: 'organizationName', header: 'Organization' },
    { key: 'amount', header: 'Amount', align: 'right', render: (p) => currency(p.amount, p.currency) },
    { key: 'refundedAmount', header: 'Refunded', align: 'right', render: (p) => (p.refundedAmount ? currency(p.refundedAmount, p.currency) : '—') },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} domain="payment" /> },
    { key: 'provider', header: 'Provider', render: (p) => label(p.provider) },
    { key: 'providerPaymentId', header: 'Reference', render: (p) => p.providerPaymentId || '—' },
    { key: 'createdAt', header: 'Date', render: (p) => dateTime(p.paidAt || p.createdAt) },
    {
      key: 'actions', header: '', align: 'right', render: (p) => (
        canManage && p.provider === 'MANUAL' && p.status === 'SUCCEEDED' && (
          <Button size="sm" variant="secondary" iconLeft={RotateCcw} onClick={(e) => { e.stopPropagation(); setModal({ type: 'refund', row: p }); }}>Refund</Button>
        )
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Billing & Payments"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Billing & Payments' }]}
        description="Payment records across all organizations. No payment provider is connected yet — payments are recorded manually."
        actions={
          <>
            <div className="w-44">
              <Select value={rangeKey} onChange={(e) => { setRangeKey(e.target.value); setPage(1); }} options={RANGE_SELECT_OPTIONS} />
            </div>
            {canManage && <Button iconLeft={Plus} onClick={() => setModal({ type: 'record' })}>Record payment</Button>}
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard label="Net Revenue" value={currency(o.netRevenue ?? 0)} icon={DollarSign} iconWrap="bg-emerald-50" iconColor="text-emerald-600"
          hint={`${num(o.successfulPayments)} payments · MRR ${currency(o.mrr ?? 0)}`} {...stat} />
        <StatCard label="Pending Payments" value={num(o.pendingPayments)} icon={Clock} iconWrap="bg-amber-50" iconColor="text-amber-600" hint="Awaiting confirmation" {...stat} />
        <StatCard label="Failed Payments" value={num(o.failedPayments)} icon={XCircle} iconWrap="bg-rose-50" iconColor="text-rose-600" hint="Needs review" {...stat} />
        <StatCard label="Refunds" value={currency(o.refundedAmount ?? 0)} icon={RotateCcw} iconWrap="bg-blue-50" iconColor="text-blue-600" hint={`${num(o.refundsIssued)} refund(s) in period`} {...stat} />
      </div>

      <FilterBar
        search={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder="Search by organization, reference or description…"
        filters={[
          { key: 'status', value: status, onChange: resetPage(setStatus), options: STATUS_OPTIONS, placeholder: 'All statuses' },
          { key: 'provider', value: provider, onChange: resetPage(setProvider), options: PROVIDER_OPTIONS, placeholder: 'All providers' },
        ]}
      />
      <DataTable
        columns={columns}
        rows={payments.data?.data || []}
        loading={payments.loading}
        error={payments.error}
        onRetry={payments.reload}
        onRowClick={(p) => setModal({ type: 'detail', row: p })}
        emptyTitle={debouncedSearch || status || provider ? 'No payments match these filters' : 'No payments in this period'}
        page={page}
        total={payments.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />

      {modal?.type === 'record' && <RecordPaymentModal onClose={() => setModal(null)} onSaved={reloadAll} />}
      {modal?.type === 'refund' && <RefundPaymentModal payment={modal.row} onClose={() => setModal(null)} onSaved={reloadAll} />}
      {modal?.type === 'detail' && <PaymentDetailModal paymentId={modal.row.id} onClose={() => setModal(null)} />}
    </div>
  );
}
