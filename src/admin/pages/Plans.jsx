import { useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../api';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { adminErrorMessage } from '../lib/adminErrors.js';
import { currency } from '../lib/format.js';
import { SectionHeader, DataTable } from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import { Button, Input, Textarea, Modal, Badge, Checkbox, ConfirmDialog, useToast } from '../../components/ui';
import { num } from '../../lib/format';

const EMPTY_FORM = {
  code: '', name: '', description: '', currency: 'USD', priceMonthly: '', priceAnnual: '', includedMinutes: '',
  seats: '1', overagePricePerMinute: '0', trialDays: '0', features: '', sortOrder: '0', isActive: true,
};

function toForm(plan) {
  if (!plan) return EMPTY_FORM;
  return {
    ...Object.fromEntries(Object.entries(plan).map(([k, v]) => [k, v ?? ''])),
    priceMonthly: String(plan.priceMonthly),
    priceAnnual: String(plan.priceAnnual),
    includedMinutes: String(plan.includedMinutes),
    seats: String(plan.seats),
    overagePricePerMinute: String(plan.overagePricePerMinute),
    trialDays: String(plan.trialDays),
    sortOrder: String(plan.sortOrder),
    features: plan.features.join('\n'),
  };
}

/** Client-side hints only — the API re-validates every field (DTO) and is authoritative. */
function validate(f) {
  const e = {};
  if (!/^[a-z0-9][a-z0-9-]{1,48}$/.test(f.code.trim().toLowerCase())) e.code = '2–49 lowercase letters, digits or dashes';
  if (f.name.trim().length < 2) e.name = 'Required';
  const money = (v) => v !== '' && Number(v) >= 0 && /^\d+(\.\d{1,2})?$/.test(String(v));
  if (!money(f.priceMonthly)) e.priceMonthly = 'Non-negative amount, max 2 decimals';
  if (!money(f.priceAnnual)) e.priceAnnual = 'Non-negative amount, max 2 decimals';
  const int = (v, min = 0) => v !== '' && Number.isInteger(Number(v)) && Number(v) >= min;
  if (!int(f.includedMinutes)) e.includedMinutes = 'Whole number ≥ 0';
  if (!int(f.seats, 1)) e.seats = 'Whole number ≥ 1';
  if (!int(f.trialDays) || Number(f.trialDays) > 365) e.trialDays = '0–365';
  if (f.overagePricePerMinute === '' || Number(f.overagePricePerMinute) < 0) e.overagePricePerMinute = 'Non-negative';
  if (!/^[A-Z]{3}$/.test(f.currency)) e.currency = '3-letter ISO code';
  return e;
}

function PlanModal({ plan, onClose, onSaved }) {
  const [form, setForm] = useState(() => toForm(plan));
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const errors = validate(form);
  const err = (k) => (touched ? errors[k] : undefined);

  const save = async () => {
    setTouched(true);
    if (Object.keys(errors).length) return;
    setSaving(true);
    const payload = {
      code: form.code.trim().toLowerCase(),
      name: form.name.trim(),
      description: form.description.trim(),
      currency: form.currency,
      priceMonthly: Number(form.priceMonthly),
      priceAnnual: Number(form.priceAnnual),
      includedMinutes: Number(form.includedMinutes),
      seats: Number(form.seats),
      overagePricePerMinute: Number(form.overagePricePerMinute),
      trialDays: Number(form.trialDays),
      sortOrder: Number(form.sortOrder || 0),
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
      isActive: form.isActive,
    };
    try {
      if (plan) await api.admin.plans.update(plan.id, payload);
      else await api.admin.plans.create(payload);
      toast.success(plan ? 'Plan updated' : 'Plan created');
      onSaved();
    } catch (e) {
      toast.error(adminErrorMessage(e, 'Failed to save plan'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title={plan ? `Edit plan — ${plan.name}` : 'Create plan'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save plan</Button>
        </>
      }
    >
      <div className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        <Input label="Plan name" value={form.name} onChange={set('name')} error={err('name')} required />
        <Input label="Code" value={form.code} onChange={set('code')} error={err('code')} hint="Stable identifier, e.g. growth" required />
        <div className="sm:col-span-2">
          <Textarea label="Description" rows={2} value={form.description} onChange={set('description')} optional />
        </div>
        <Input label="Monthly price" type="number" step="0.01" min="0" value={form.priceMonthly} onChange={set('priceMonthly')} error={err('priceMonthly')} required />
        <Input label="Annual price" type="number" step="0.01" min="0" value={form.priceAnnual} onChange={set('priceAnnual')} error={err('priceAnnual')} required />
        <Input label="Currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} maxLength={3} error={err('currency')} />
        <Input label="Included minutes / period" type="number" min="0" value={form.includedMinutes} onChange={set('includedMinutes')} error={err('includedMinutes')} hint="Call-minute credit allowance" required />
        <Input label="Seats" type="number" min="1" value={form.seats} onChange={set('seats')} error={err('seats')} required />
        <Input label="Overage price / minute" type="number" step="0.0001" min="0" value={form.overagePricePerMinute} onChange={set('overagePricePerMinute')} error={err('overagePricePerMinute')} />
        <Input label="Trial period (days)" type="number" min="0" max="365" value={form.trialDays} onChange={set('trialDays')} error={err('trialDays')} />
        <Input label="Sort order" type="number" min="0" value={form.sortOrder} onChange={set('sortOrder')} />
        <div className="sm:col-span-2">
          <Textarea label="Features" rows={4} value={form.features} onChange={set('features')} hint="One feature per line" optional />
        </div>
        <div className="sm:col-span-2">
          <Checkbox label="Active (available for new subscriptions)" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
        </div>
      </div>
    </Modal>
  );
}

export default function AdminPlans() {
  const { can } = useAdminAccess();
  const canManage = can(P.PLANS_MANAGE);
  const toast = useToast();
  const list = useAdminQuery((signal) => api.admin.plans.list({ signal }), []);
  const [editing, setEditing] = useState(null); // plan | 'new' | null
  const [archiving, setArchiving] = useState(null);
  const [busy, setBusy] = useState(false);

  const setActive = async (plan, isActive) => {
    setBusy(true);
    try {
      if (isActive) await api.admin.plans.activate(plan.id);
      else await api.admin.plans.archive(plan.id);
      toast.success(isActive ? 'Plan activated' : 'Plan archived');
      setArchiving(null);
      list.reload();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Action failed'));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Plan', render: (p) => (
      <div>
        <p className="font-medium text-slate-800">{p.name}</p>
        <p className="text-xs text-slate-400">{p.code}</p>
      </div>
    ) },
    { key: 'priceMonthly', header: 'Monthly', align: 'right', render: (p) => currency(p.priceMonthly, p.currency) },
    { key: 'priceAnnual', header: 'Annual', align: 'right', render: (p) => currency(p.priceAnnual, p.currency) },
    { key: 'includedMinutes', header: 'Minutes', align: 'right', render: (p) => num(p.includedMinutes) },
    { key: 'seats', header: 'Seats', align: 'right', render: (p) => num(p.seats) },
    { key: 'overagePricePerMinute', header: 'Overage/min', align: 'right', render: (p) => currency(p.overagePricePerMinute, p.currency) },
    { key: 'trialDays', header: 'Trial', render: (p) => (p.trialDays ? `${p.trialDays} days` : '—') },
    { key: 'liveSubscriptions', header: 'Live subs', align: 'right', render: (p) => num(p.liveSubscriptions) },
    { key: 'isActive', header: 'Status', render: (p) => <Badge tone={p.isActive ? 'success' : 'neutral'} dot>{p.isActive ? 'Active' : 'Archived'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: (p) => canManage && (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>Edit</Button>
          {p.isActive ? (
            <Button size="sm" variant="danger" onClick={() => setArchiving(p)}>Archive</Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setActive(p, true)} disabled={busy}>Activate</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Plans & Pricing"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Plans & Pricing' }]}
        description="Pricing, call-minute allowances and features for every sellable plan."
        actions={canManage && <Button iconLeft={Plus} onClick={() => setEditing('new')}>New plan</Button>}
      />
      <DataTable
        columns={columns}
        rows={list.data || []}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle="No plans yet"
        emptyHint={canManage ? 'Create your first plan to start assigning subscriptions.' : undefined}
      />
      {editing && (
        <PlanModal plan={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }} />
      )}
      <ConfirmDialog
        open={!!archiving}
        onClose={() => setArchiving(null)}
        onConfirm={() => setActive(archiving, false)}
        title="Archive plan"
        message={archiving ? `${archiving.name} will no longer be available for new subscriptions. Its ${archiving.liveSubscriptions} live subscription(s) keep running unchanged.` : ''}
        confirmLabel="Archive"
        tone="danger"
        loading={busy}
      />
    </div>
  );
}
