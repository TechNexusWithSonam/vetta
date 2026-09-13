import { useState } from 'react';
import { api } from '../../../../api';
import { useAuth } from '../../../../context/useAuth';
import { useAdminAsync } from '../../../lib/useAdminAsync.js';
import { logAdminAction } from '../../../lib/auditLog.js';
import { StatusBadge, DemoDataBadge } from '../../../components';
import { Button, Select, Modal, ConfirmDialog, ErrorState, LoadingState, useToast } from '../../../../components/ui';
import { money, dateTime } from '../../../../lib/format';

export default function SubscriptionTab({ org, onOrgChanged }) {
  const sub = useAdminAsync(() => api.admin.organizations.subscriptionOf(org.id), [org.id]);
  const plansQ = useAdminAsync(() => api.admin.plans.list(), []);
  const [changing, setChanging] = useState(false);
  const [planId, setPlanId] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  if (sub.loading || plansQ.loading) return <LoadingState label="Loading subscription…" />;
  if (sub.error) return <ErrorState error={sub.error} onRetry={sub.reload} />;
  const s = sub.data;
  const plans = plansQ.data || [];

  const changePlan = async () => {
    setSaving(true);
    try {
      await api.admin.subscriptions.changePlan(s.id, { planId });
      await logAdminAction({
        action: 'subscription.plan_change', entityType: 'subscription', entityId: s.id, organizationId: org.id,
        summary: `Changed ${org.name}'s plan`, metadata: { planId }, actor: user,
      });
      toast.success('Plan changed');
      setChanging(false);
      sub.reload();
      onOrgChanged?.();
    } catch (err) {
      toast.error(err?.message || 'Failed to change plan');
    } finally {
      setSaving(false);
    }
  };

  const cancelSubscription = async () => {
    setSaving(true);
    try {
      await api.admin.subscriptions.cancel(s.id, { reason: 'Cancelled by admin' });
      await logAdminAction({
        action: 'subscription.cancel', entityType: 'subscription', entityId: s.id, organizationId: org.id,
        summary: `Cancelled ${org.name}'s subscription`, actor: user,
      });
      toast.success('Subscription cancelled');
      setCancelling(false);
      sub.reload();
      onOrgChanged?.();
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel subscription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      {sub.isMock && <DemoDataBadge />}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><dt className="text-slate-400">Plan</dt><dd className="text-slate-800 font-medium">{s.planName}</dd></div>
        <div><dt className="text-slate-400">Status</dt><dd><StatusBadge status={s.status} domain="subscription" /></dd></div>
        <div><dt className="text-slate-400">MRR</dt><dd className="text-slate-800 font-medium">{money(s.mrr)}</dd></div>
        <div><dt className="text-slate-400">Payment status</dt><dd className="text-slate-800 font-medium">{s.paymentStatus}</dd></div>
        <div><dt className="text-slate-400">Started</dt><dd className="text-slate-800 font-medium">{dateTime(s.startedAt)}</dd></div>
        <div><dt className="text-slate-400">Renews</dt><dd className="text-slate-800 font-medium">{dateTime(s.renewsAt)}</dd></div>
      </dl>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => { setPlanId(s.planId); setChanging(true); }}>Change plan</Button>
        {s.status !== 'CANCELLED' && <Button variant="danger" onClick={() => setCancelling(true)}>Cancel subscription</Button>}
      </div>

      <Modal
        open={changing}
        onClose={() => setChanging(false)}
        title="Change plan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setChanging(false)} disabled={saving}>Cancel</Button>
            <Button onClick={changePlan} loading={saving}>Save</Button>
          </>
        }
      >
        <Select label="Plan" value={planId} onChange={(e) => setPlanId(e.target.value)} options={plans.map((p) => ({ value: p.id, label: p.name }))} />
      </Modal>

      <ConfirmDialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        onConfirm={cancelSubscription}
        title="Cancel subscription"
        message={`${org.name}'s subscription will be cancelled at the end of the current billing period.`}
        confirmLabel="Cancel subscription"
        tone="danger"
        loading={saving}
      />
    </div>
  );
}
