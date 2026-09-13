import { useMemo, useState } from 'react';
import { DollarSign, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/useAuth';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { logAdminAction } from '../lib/auditLog.js';
import { SectionHeader, StatCard, DataTable, FilterBar, StatusBadge } from '../components';
import { Button, ConfirmDialog, useToast } from '../../components/ui';
import { money, dateTime } from '../../lib/format';

const STATUS_OPTIONS = ['paid', 'open', 'failed', 'refunded'].map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }));

export default function AdminBilling() {
  const { user: actor } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [refunding, setRefunding] = useState(null);
  const [saving, setSaving] = useState(false);
  const limit = 10;

  const overview = useAdminAsync(() => api.admin.billing.overview(), []);
  const query = useMemo(() => ({ page, limit, status: status || undefined }), [page, status]);
  const invoices = useAdminAsync(() => api.admin.billing.invoices.list(query), [JSON.stringify(query)]);
  const items = invoices.data?.items || [];
  const o = overview.data || {};

  const refund = async () => {
    setSaving(true);
    try {
      await api.admin.billing.invoices.refund(refunding.id, { amount: refunding.amount, reason: 'Refunded by admin' });
      await logAdminAction({
        action: 'billing.refund', entityType: 'invoice', entityId: refunding.id, organizationId: refunding.organizationId,
        summary: `Refunded invoice ${refunding.id} (${refunding.organizationName})`, metadata: { amount: refunding.amount }, actor,
      });
      toast.success('Invoice refunded');
      setRefunding(null);
      invoices.reload();
      overview.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to refund invoice');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'id', header: 'Invoice' },
    { key: 'organizationName', header: 'Organization' },
    { key: 'amount', header: 'Amount', align: 'right', render: (i) => money(i.amount) },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} domain="invoice" /> },
    { key: 'issuedAt', header: 'Issued', render: (i) => dateTime(i.issuedAt) },
    {
      key: 'actions', header: '', align: 'right', render: (i) => (
        i.status === 'paid' && <Button size="sm" variant="secondary" iconLeft={RotateCcw} onClick={() => setRefunding(i)}>Refund</Button>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader title="Billing & Payments" breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Billing & Payments' }]} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard label="Total Revenue" value={money(o.totalRevenue)} icon={DollarSign} iconWrap="bg-emerald-50" iconColor="text-emerald-600" hint={`MRR ${money(o.mrr)}`} loading={overview.loading} isMock={overview.isMock} />
        <StatCard label="Outstanding Invoices" value={o.outstandingInvoices ?? 0} icon={XCircle} iconWrap="bg-amber-50" iconColor="text-amber-600" hint="Awaiting payment" loading={overview.loading} isMock={overview.isMock} />
        <StatCard label="Failed Payments" value={o.failedPayments ?? 0} icon={XCircle} iconWrap="bg-rose-50" iconColor="text-rose-600" hint="Needs review" loading={overview.loading} isMock={overview.isMock} />
        <StatCard label="Refunds Issued" value={o.refundsIssued ?? 0} icon={CheckCircle2} iconWrap="bg-blue-50" iconColor="text-blue-600" hint="All time" loading={overview.loading} isMock={overview.isMock} />
      </div>

      <FilterBar
        filters={[{ key: 'status', value: status, onChange: (v) => { setStatus(v); setPage(1); }, options: STATUS_OPTIONS, placeholder: 'All statuses' }]}
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={invoices.loading}
        error={invoices.error}
        onRetry={invoices.reload}
        isMock={invoices.isMock}
        emptyTitle="No invoices match these filters"
        page={page}
        total={invoices.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
      <ConfirmDialog
        open={!!refunding}
        onClose={() => setRefunding(null)}
        onConfirm={refund}
        title="Refund invoice"
        message={refunding ? `Refund ${money(refunding.amount)} for invoice ${refunding.id}?` : ''}
        confirmLabel="Refund"
        tone="danger"
        loading={saving}
      />
    </div>
  );
}
