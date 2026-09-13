import { useMemo, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/useAuth';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { logAdminAction } from '../lib/auditLog.js';
import { SectionHeader, DataTable, FilterBar, StatusBadge } from '../components';
import { Button, ConfirmDialog, useToast } from '../../components/ui';
import { money, dateTime } from '../../lib/format';

const STATUS_OPTIONS = ['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'].map((s) => ({ value: s, label: s.replace('_', ' ') }));

export default function AdminSubscriptions() {
  const { user: actor } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [cancelling, setCancelling] = useState(null);
  const [saving, setSaving] = useState(false);
  const limit = 10;

  const query = useMemo(() => ({ page, limit, search: search || undefined, status: status || undefined }), [page, search, status]);
  const list = useAdminAsync(() => api.admin.subscriptions.list(query), [JSON.stringify(query)]);
  const items = list.data?.items || [];

  const confirmCancel = async () => {
    setSaving(true);
    try {
      await api.admin.subscriptions.cancel(cancelling.id, { reason: 'Cancelled by admin' });
      await logAdminAction({
        action: 'subscription.cancel', entityType: 'subscription', entityId: cancelling.id, organizationId: cancelling.organizationId,
        summary: `Cancelled subscription for ${cancelling.organizationName}`, actor,
      });
      toast.success('Subscription cancelled');
      setCancelling(null);
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel subscription');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'organizationName', header: 'Organization' },
    { key: 'planName', header: 'Plan' },
    { key: 'mrr', header: 'MRR', align: 'right', render: (s) => money(s.mrr) },
    { key: 'startedAt', header: 'Start date', render: (s) => dateTime(s.startedAt) },
    { key: 'renewsAt', header: 'Renewal date', render: (s) => dateTime(s.renewsAt) },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} domain="subscription" /> },
    { key: 'paymentStatus', header: 'Payment' },
    {
      key: 'actions', header: '', align: 'right', render: (s) => (
        s.status !== 'CANCELLED' && <Button size="sm" variant="danger" onClick={() => setCancelling(s)}>Cancel</Button>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader title="Subscriptions" breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Subscriptions' }]} />
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by organization…"
        filters={[{ key: 'status', value: status, onChange: (v) => { setStatus(v); setPage(1); }, options: STATUS_OPTIONS, placeholder: 'All statuses' }]}
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        isMock={list.isMock}
        emptyTitle="No subscriptions match these filters"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
      <ConfirmDialog
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={confirmCancel}
        title="Cancel subscription"
        message={cancelling ? `Cancel ${cancelling.organizationName}'s subscription?` : ''}
        confirmLabel="Cancel subscription"
        tone="danger"
        loading={saving}
      />
    </div>
  );
}
