import { useState } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Percent, Plus } from 'lucide-react';
import { api } from '../../api';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { adminErrorMessage } from '../lib/adminErrors.js';
import { currentMonth } from '../lib/dateRange.js';
import { currency, label, percent } from '../lib/format.js';
import { SectionHeader, StatCard, DataTable } from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import { Badge, Button, Checkbox, ConfirmDialog, Input, Modal, Select, Textarea, useToast } from '../../components/ui';

const KIND_OPTIONS = ['HOSTING', 'DATABASE', 'STORAGE', 'SMS', 'TELEPHONY', 'AI', 'OTHER'].map((k) => ({ value: k, label: label(k) }));

function CategoryModal({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    kind: category?.kind || 'HOSTING',
    provider: category?.provider || '',
    monthlyCost: category ? String(category.monthlyCost) : '',
    notes: category?.notes || '',
    isActive: category?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const costValid = form.monthlyCost !== '' && Number(form.monthlyCost) >= 0 && /^\d+(\.\d{1,2})?$/.test(form.monthlyCost);
  const valid = form.name.trim().length >= 2 && costValid;

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      kind: form.kind,
      provider: form.provider.trim(),
      monthlyCost: Number(form.monthlyCost),
      notes: form.notes.trim(),
      isActive: form.isActive,
    };
    try {
      if (category) await api.admin.cogs.update(category.id, payload);
      else await api.admin.cogs.create(payload);
      toast.success(category ? 'Cost category updated' : 'Cost category added');
      onSaved();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to save cost category'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title={category ? `Edit ${category.name}` : 'Add fixed cost'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={!valid}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Name" value={form.name} onChange={set('name')} required />
        <Select label="Category" value={form.kind} onChange={set('kind')} options={KIND_OPTIONS} />
        <Input label="Provider" value={form.provider} onChange={set('provider')} optional placeholder="e.g. AWS, Vercel, Neon" />
        <Input label="Monthly cost (USD)" type="number" step="0.01" min="0" value={form.monthlyCost} onChange={set('monthlyCost')}
          error={form.monthlyCost && !costValid ? 'Non-negative amount, max 2 decimals' : undefined} required />
        <Textarea label="Notes" rows={2} value={form.notes} onChange={set('notes')} optional />
        <Checkbox label="Include in COGS" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
      </div>
    </Modal>
  );
}

export default function AdminCogs() {
  const { can } = useAdminAccess();
  const canManage = can(P.COGS_MANAGE);
  const toast = useToast();
  const [month, setMonth] = useState(currentMonth());
  const [editing, setEditing] = useState(null); // category | 'new'
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const q = useAdminQuery((signal) => api.admin.cogs.breakdown({ month }, { signal }), [month]);
  const d = q.data || {};
  const s = d.summary || {};
  const stat = { loading: q.loading, error: q.error };

  const remove = async () => {
    setBusy(true);
    try {
      await api.admin.cogs.remove(deleting.id);
      toast.success('Cost category deleted');
      setDeleting(null);
      q.reload();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to delete cost category'));
    } finally {
      setBusy(false);
    }
  };

  const recordedColumns = [
    { key: 'name', header: 'Cost source' },
    { key: 'usage', header: 'Usage' },
    { key: 'monthlyCost', header: 'Cost', align: 'right', render: (c) => currency(c.monthlyCost) },
  ];
  const manualColumns = [
    { key: 'name', header: 'Name' },
    { key: 'kind', header: 'Category', render: (c) => label(c.kind) },
    { key: 'provider', header: 'Provider', render: (c) => c.provider || '—' },
    { key: 'monthlyCost', header: 'Monthly cost', align: 'right', render: (c) => currency(c.monthlyCost) },
    { key: 'isActive', header: 'Status', render: (c) => <Badge tone={c.isActive ? 'success' : 'neutral'} dot>{c.isActive ? 'Included' : 'Excluded'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: (c) => canManage && (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing(c)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => setDeleting(c)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="COGS"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'COGS' }]}
        description="Cost of goods sold. Telephony and AI costs are summed from what each call and AI request actually recorded; fixed costs are maintained below."
        actions={
          <div className="w-44">
            <Input type="month" aria-label="Month" value={month} max={currentMonth()} onChange={(e) => e.target.value && setMonth(e.target.value)} />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Revenue" value={currency(s.totalRevenue ?? 0)} icon={DollarSign} iconWrap="bg-emerald-50" iconColor="text-emerald-600" hint="Net collected payments" {...stat} />
        <StatCard label="Total COGS" value={currency(s.totalCost ?? 0)} icon={TrendingDown} iconWrap="bg-rose-50" iconColor="text-rose-600"
          hint={`Usage ${currency(s.recordedCost ?? 0)} · Fixed ${currency(s.fixedCost ?? 0)}`} {...stat} />
        <StatCard label="Gross Profit" value={currency(s.grossProfit ?? 0)} icon={TrendingUp} iconWrap="bg-blue-50" iconColor="text-blue-600" hint={d.month} {...stat} />
        <StatCard label="Gross Margin" value={percent(s.grossMarginPct)} icon={Percent} iconWrap="bg-indigo-50" iconColor="text-indigo-600"
          hint={s.grossMarginPct === null ? 'No revenue this month' : 'Of net revenue'} {...stat} />
      </div>

      <section>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Usage-based costs (recorded)</h3>
        <DataTable columns={recordedColumns} rows={d.recorded || []} loading={q.loading} error={q.error} onRetry={q.reload}
          emptyTitle="No telephony or AI usage recorded this month" />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">Fixed monthly costs</h3>
          {canManage && <Button size="sm" iconLeft={Plus} onClick={() => setEditing('new')}>Add fixed cost</Button>}
        </div>
        <DataTable columns={manualColumns} rows={d.manual || []} loading={q.loading} error={q.error} onRetry={q.reload}
          emptyTitle="No fixed costs configured" emptyHint={canManage ? 'Add hosting, database, storage and other monthly costs.' : undefined} />
      </section>

      {d.referenceRates && (
        <details className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-sm">
          <summary className="cursor-pointer font-medium text-slate-700">Reference rates used when a provider doesn’t report cost</summary>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 text-slate-600">
            <div>
              <p className="font-semibold text-slate-700 mb-1">Voice (USD / minute)</p>
              {Object.entries(d.referenceRates.voiceUsdPerMinute).map(([k, v]) => <p key={k}>{k}: ${v}</p>)}
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">AI (USD / 1M tokens, in / out)</p>
              {Object.entries(d.referenceRates.aiUsdPerMillionTokens).map(([k, v]) => <p key={k}>{k}: ${v.input} / ${v.output}</p>)}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Set in the backend source (cost-tracking constants); not editable here.</p>
        </details>
      )}

      {editing && (
        <CategoryModal category={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); q.reload(); }} />
      )}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title="Delete cost category"
        message={deleting ? `Delete “${deleting.name}”? It will no longer count toward COGS in any month.` : ''}
        confirmLabel="Delete"
        tone="danger"
        loading={busy}
      />
    </div>
  );
}
