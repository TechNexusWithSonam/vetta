import { useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/useAuth';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { logAdminAction } from '../lib/auditLog.js';
import { SectionHeader, DataTable, DemoDataBadge } from '../components';
import { Button, Input, Modal, Badge, Checkbox, useToast } from '../../components/ui';
import { money, pct } from '../../lib/format';

const emptyForm = { name: '', priceMonthly: '', priceAnnual: '', includedMinutes: '', seats: '', usageLimit: '', extraUsagePrice: '', trialDays: '', isActive: true };

function PlanModal({ plan, onClose, onSaved }) {
  const [form, setForm] = useState(plan ? { ...plan } : emptyForm);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { user: actor } = useAuth();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    const payload = {
      ...form,
      priceMonthly: Number(form.priceMonthly), priceAnnual: Number(form.priceAnnual),
      includedMinutes: Number(form.includedMinutes), seats: Number(form.seats),
      usageLimit: Number(form.usageLimit), extraUsagePrice: Number(form.extraUsagePrice),
      trialDays: Number(form.trialDays),
    };
    try {
      if (plan) {
        await api.admin.plans.update(plan.id, payload);
        await logAdminAction({ action: 'plan.update', entityType: 'plan', entityId: plan.id, summary: `Updated plan ${form.name}`, metadata: payload, actor });
      } else {
        const created = await api.admin.plans.create(payload);
        await logAdminAction({ action: 'plan.create', entityType: 'plan', entityId: created?.data?.id, summary: `Created plan ${form.name}`, metadata: payload, actor });
      }
      toast.success(plan ? 'Plan updated' : 'Plan created');
      onSaved();
    } catch (err) {
      toast.error(err?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={plan ? 'Edit plan' : 'Create plan'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save plan</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Plan name" value={form.name} onChange={set('name')} required className="sm:col-span-2" />
        <Input label="Monthly price ($)" type="number" value={form.priceMonthly} onChange={set('priceMonthly')} />
        <Input label="Annual price ($)" type="number" value={form.priceAnnual} onChange={set('priceAnnual')} />
        <Input label="Included minutes" type="number" value={form.includedMinutes} onChange={set('includedMinutes')} />
        <Input label="Seats" type="number" value={form.seats} onChange={set('seats')} />
        <Input label="Usage limit" type="number" value={form.usageLimit} onChange={set('usageLimit')} />
        <Input label="Extra usage price ($/unit)" type="number" step="0.01" value={form.extraUsagePrice} onChange={set('extraUsagePrice')} />
        <Input label="Trial period (days)" type="number" value={form.trialDays} onChange={set('trialDays')} />
        <div className="sm:col-span-2 pt-1">
          <Checkbox label="Active" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
        </div>
      </div>
    </Modal>
  );
}

export default function AdminPlans() {
  const { user: actor } = useAuth();
  const toast = useToast();
  const list = useAdminAsync(() => api.admin.plans.list(), []);
  const [editing, setEditing] = useState(null); // plan | 'new' | null
  const items = list.data || [];

  const toggleActive = async (plan) => {
    try {
      if (plan.isActive) {
        await api.admin.plans.archive(plan.id);
        await logAdminAction({ action: 'plan.archive', entityType: 'plan', entityId: plan.id, summary: `Archived plan ${plan.name}`, actor });
        toast.success('Plan archived');
      } else {
        await api.admin.plans.activate(plan.id);
        await logAdminAction({ action: 'plan.update', entityType: 'plan', entityId: plan.id, summary: `Activated plan ${plan.name}`, actor });
        toast.success('Plan activated');
      }
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Action failed');
    }
  };

  const columns = [
    { key: 'name', header: 'Plan' },
    { key: 'priceMonthly', header: 'Monthly', align: 'right', render: (p) => money(p.priceMonthly) },
    { key: 'priceAnnual', header: 'Annual', align: 'right', render: (p) => money(p.priceAnnual) },
    { key: 'includedMinutes', header: 'Minutes' },
    { key: 'seats', header: 'Seats' },
    {
      key: 'margin', header: 'Est. margin', align: 'right', render: (p) => {
        const margin = p.priceMonthly ? ((p.priceMonthly - p.estCogsPerSeat) / p.priceMonthly) * 100 : 0;
        return <span className={margin > 60 ? 'text-emerald-600 font-medium' : margin > 30 ? 'text-amber-600 font-medium' : 'text-rose-600 font-medium'}>{pct(margin)}</span>;
      },
    },
    { key: 'isActive', header: 'Status', render: (p) => <Badge tone={p.isActive ? 'success' : 'neutral'} dot>{p.isActive ? 'Active' : 'Archived'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: (p) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>Edit</Button>
          <Button size="sm" variant={p.isActive ? 'danger' : 'secondary'} onClick={() => toggleActive(p)}>{p.isActive ? 'Archive' : 'Activate'}</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Plans & Pricing"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Plans & Pricing' }]}
        actions={<Button iconLeft={Plus} onClick={() => setEditing('new')}>New plan</Button>}
      />
      {list.isMock && !list.loading && <div className="mb-4"><DemoDataBadge /></div>}
      <DataTable columns={columns} rows={items} loading={list.loading} error={list.error} onRetry={list.reload} emptyTitle="No plans yet" />
      {editing && (
        <PlanModal
          plan={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); list.reload(); }}
        />
      )}
    </div>
  );
}
