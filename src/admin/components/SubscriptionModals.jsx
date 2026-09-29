import { useState } from 'react';
import { api } from '../../api';
import { Button, Checkbox, Modal, Radio, Select, Textarea, useToast } from '../../components/ui';
import { adminErrorMessage } from '../lib/adminErrors.js';
import { currency } from '../lib/format.js';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { OrganizationPicker } from './OrganizationPicker.jsx';

const INTERVALS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'ANNUAL', label: 'Annual' },
];

function useActivePlans() {
  const q = useAdminQuery((signal) => api.admin.plans.list({ signal }), []);
  return { ...q, plans: (q.data || []).filter((p) => p.isActive) };
}

const planOption = (p) => ({
  value: p.id,
  label: `${p.name} — ${currency(p.priceMonthly, p.currency)}/mo · ${currency(p.priceAnnual, p.currency)}/yr`,
});

/** Subscribe an organization (with no live subscription) to a plan. */
export function AssignSubscriptionModal({ organization, onClose, onSaved }) {
  const { plans, loading, error } = useActivePlans();
  const [organizationId, setOrganizationId] = useState(organization?.id || '');
  const [planId, setPlanId] = useState('');
  const [billingInterval, setBillingInterval] = useState('MONTHLY');
  const [startTrial, setStartTrial] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const plan = plans.find((p) => p.id === planId);

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.subscriptions.assign({ organizationId, planId, billingInterval, startTrial });
      toast.success('Subscription created');
      onSaved?.();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to create subscription'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title="Assign plan"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={!organizationId || !planId}>Create subscription</Button>
        </>
      }
    >
      <div className="space-y-4">
        {organization ? null : <OrganizationPicker value={organizationId} onChange={setOrganizationId} required />}
        {error ? (
          <p className="text-sm text-rose-600">{adminErrorMessage(error)}</p>
        ) : !loading && plans.length === 0 ? (
          <p className="text-sm text-slate-500">No active plans exist yet — create one under Plans &amp; Pricing first.</p>
        ) : (
          <Select label="Plan" value={planId} onChange={(e) => setPlanId(e.target.value)} placeholder={loading ? 'Loading plans…' : 'Select a plan'} options={plans.map(planOption)} />
        )}
        <Select label="Billing interval" value={billingInterval} onChange={(e) => setBillingInterval(e.target.value)} options={INTERVALS} />
        {plan?.trialDays > 0 && (
          <Checkbox label={`Start with the plan's ${plan.trialDays}-day trial`} checked={startTrial} onChange={(e) => setStartTrial(e.target.checked)} />
        )}
      </div>
    </Modal>
  );
}

export function ChangePlanModal({ subscription, onClose, onSaved }) {
  const { plans, loading, error } = useActivePlans();
  const [planId, setPlanId] = useState(subscription.planId);
  const [billingInterval, setBillingInterval] = useState(subscription.billingInterval);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const unchanged = planId === subscription.planId && billingInterval === subscription.billingInterval;

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.subscriptions.changePlan(subscription.id, { planId, billingInterval });
      toast.success('Plan changed');
      onSaved?.();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to change plan'));
    } finally {
      setSaving(false);
    }
  };

  // Keep the current (possibly archived) plan selectable so the form reflects reality.
  const options = plans.some((p) => p.id === subscription.planId)
    ? plans.map(planOption)
    : [{ value: subscription.planId, label: `${subscription.planName} (current, archived)` }, ...plans.map(planOption)];

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title={`Change plan — ${subscription.organizationName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={unchanged || loading}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? <p className="text-sm text-rose-600">{adminErrorMessage(error)}</p> : (
          <Select label="Plan" value={planId} onChange={(e) => setPlanId(e.target.value)} options={options} />
        )}
        <Select label="Billing interval" value={billingInterval} onChange={(e) => setBillingInterval(e.target.value)} options={INTERVALS} />
        <p className="text-xs text-slate-500">Takes effect immediately; the current billing period is unchanged.</p>
      </div>
    </Modal>
  );
}

export function CancelSubscriptionModal({ subscription, onClose, onSaved }) {
  const [atPeriodEnd, setAtPeriodEnd] = useState(true);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const confirm = async () => {
    setSaving(true);
    try {
      await api.admin.subscriptions.cancel(subscription.id, { atPeriodEnd, reason: reason.trim() || undefined });
      toast.success(atPeriodEnd ? 'Cancellation scheduled' : 'Subscription cancelled');
      onSaved?.();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to cancel subscription'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title="Cancel subscription"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Keep subscription</Button>
          <Button variant="danger" onClick={confirm} loading={saving}>Cancel subscription</Button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-slate-600">Cancel {subscription.organizationName}’s {subscription.planName} subscription?</p>
        <Radio name="cancel-when" label="At the end of the current billing period" checked={atPeriodEnd} onChange={() => setAtPeriodEnd(true)} />
        <Radio name="cancel-when" label="Immediately" checked={!atPeriodEnd} onChange={() => setAtPeriodEnd(false)} />
        <Textarea label="Reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} optional />
      </div>
    </Modal>
  );
}
