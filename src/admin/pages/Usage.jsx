import { useState } from 'react';
import { PhoneCall, Gauge, Cpu, Wallet } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/useAuth';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { logAdminAction } from '../lib/auditLog.js';
import { SectionHeader, StatCard, DataTable } from '../components';
import { Button, Input, Modal, Badge as UiBadge, useToast } from '../../components/ui';
import { num } from '../../lib/format';

export default function AdminUsage() {
  const { user: actor } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [adjusting, setAdjusting] = useState(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const limit = 10;

  const overview = useAdminAsync(() => api.admin.usage.overview(), []);
  const list = useAdminAsync(() => api.admin.usage.list({ page, limit }), [page]);
  const o = overview.data || {};
  const items = list.data?.items || [];

  const applyAdjustment = async () => {
    setSaving(true);
    try {
      await api.admin.usage.credits.adjust(adjusting.organizationId, { amount: Number(amount), reason: 'Manual admin adjustment' });
      await logAdminAction({
        action: 'usage.credits_adjust', entityType: 'organization', entityId: adjusting.organizationId, organizationId: adjusting.organizationId,
        summary: `Adjusted credits for ${adjusting.organizationName} by ${amount}`, metadata: { amount }, actor,
      });
      toast.success('Credits adjusted');
      setAdjusting(null);
      setAmount('');
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to adjust credits');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'organizationName', header: 'Organization' },
    { key: 'plan', header: 'Plan' },
    { key: 'calls', header: 'Calls', align: 'right', render: (r) => num(r.calls) },
    { key: 'minutes', header: 'Minutes', align: 'right', render: (r) => num(r.minutes) },
    { key: 'creditsRemaining', header: 'Credits', align: 'right', render: (r) => (
      <span className="flex items-center justify-end gap-2">
        {num(r.creditsRemaining)} / {num(r.creditsLimit)}
        {r.highUsage && <UiBadge tone="warning" size="sm">Low</UiBadge>}
      </span>
    ) },
    {
      key: 'actions', header: '', align: 'right', render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => setAdjusting(r)}>Adjust</Button>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader title="Usage & Credits" breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Usage & Credits' }]} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard label="Total Calls" value={num(o.totalCalls)} icon={PhoneCall} iconWrap="bg-orange-50" iconColor="text-orange-600" loading={overview.loading} isMock={overview.isMock} />
        <StatCard label="Total Minutes" value={num(o.totalMinutes)} icon={Gauge} iconWrap="bg-blue-50" iconColor="text-blue-600" loading={overview.loading} isMock={overview.isMock} />
        <StatCard label="AI Tokens" value={num(o.totalAiTokens)} icon={Cpu} iconWrap="bg-violet-50" iconColor="text-violet-600" loading={overview.loading} isMock={overview.isMock} />
        <StatCard label="Credits Consumed" value={num(o.totalCreditsConsumed)} icon={Wallet} iconWrap="bg-emerald-50" iconColor="text-emerald-600" loading={overview.loading} isMock={overview.isMock} />
      </div>

      <DataTable
        columns={columns}
        rows={items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        isMock={list.isMock}
        emptyTitle="No usage data yet"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />

      <Modal
        open={!!adjusting}
        onClose={() => setAdjusting(null)}
        title={adjusting ? `Adjust credits — ${adjusting.organizationName}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjusting(null)} disabled={saving}>Cancel</Button>
            <Button onClick={applyAdjustment} loading={saving} disabled={!amount}>Apply</Button>
          </>
        }
      >
        <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} hint="Positive to add credits, negative to deduct." />
      </Modal>
    </div>
  );
}
