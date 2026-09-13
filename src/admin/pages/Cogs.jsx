import { useState } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/useAuth';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { logAdminAction } from '../lib/auditLog.js';
import { SectionHeader, StatCard, DataTable } from '../components';
import { Button, Input, Modal, useToast } from '../../components/ui';
import { money, pct } from '../../lib/format';

export default function AdminCogs() {
  const { user: actor } = useAuth();
  const toast = useToast();
  const categories = useAdminAsync(() => api.admin.cogs.categories.list(), []);
  const summary = useAdminAsync(() => api.admin.cogs.summary(), []);
  const [editing, setEditing] = useState(null);
  const [unitCost, setUnitCost] = useState('');
  const [saving, setSaving] = useState(false);

  const s = summary.data || {};
  const items = categories.data || [];

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.cogs.categories.update(editing.id, { unitCost: Number(unitCost) });
      await logAdminAction({
        action: 'cogs.category_update', entityType: 'cogs_category', entityId: editing.id,
        summary: `Updated unit cost for ${editing.name}`, metadata: { unitCost: Number(unitCost) }, actor,
      });
      toast.success('Cost category updated');
      setEditing(null);
      categories.reload();
      summary.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Category' },
    { key: 'provider', header: 'Provider' },
    { key: 'unitCost', header: 'Unit cost', align: 'right', render: (c) => (c.unitCost ? `$${c.unitCost} ${c.unit}` : c.unit) },
    { key: 'monthlyCost', header: 'Monthly cost', align: 'right', render: (c) => money(c.monthlyCost) },
    {
      key: 'actions', header: '', align: 'right', render: (c) => (
        <Button size="sm" variant="secondary" onClick={() => { setEditing(c); setUnitCost(String(c.unitCost)); }}>Edit</Button>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader title="COGS" breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'COGS' }]} description="Cost of goods sold — telephony, AI/API, hosting, database, storage, SMS and other infrastructure." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard label="Revenue" value={money(s.totalRevenue)} icon={DollarSign} iconWrap="bg-emerald-50" iconColor="text-emerald-600" loading={summary.loading} isMock={summary.isMock} />
        <StatCard label="Total COGS" value={money(s.totalCost)} icon={TrendingDown} iconWrap="bg-rose-50" iconColor="text-rose-600" loading={summary.loading} isMock={summary.isMock} />
        <StatCard label="Gross Profit" value={money(s.grossProfit)} icon={TrendingUp} iconWrap="bg-blue-50" iconColor="text-blue-600" loading={summary.loading} isMock={summary.isMock} />
        <StatCard label="Gross Margin" value={pct(s.grossMarginPct)} icon={Percent} iconWrap="bg-indigo-50" iconColor="text-indigo-600" loading={summary.loading} isMock={summary.isMock} />
      </div>

      <DataTable columns={columns} rows={items} loading={categories.loading} error={categories.error} onRetry={categories.reload} isMock={categories.isMock} emptyTitle="No cost categories configured" />

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        <Input label={`Unit cost (${editing?.unit || ''})`} type="number" step="0.001" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
      </Modal>
    </div>
  );
}
