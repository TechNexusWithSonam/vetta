import { useState } from 'react';
import { api } from '../../api';
import { Button, ErrorState, Input, LoadingState, Modal, Select, Textarea, useToast } from '../../components/ui';
import { dateTime } from '../../lib/format';
import { adminErrorMessage, friendlyError } from '../lib/adminErrors.js';
import { currency } from '../lib/format.js';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { DetailList } from './DetailList.jsx';
import { OrganizationPicker } from './OrganizationPicker.jsx';
import { StatusBadge } from './StatusBadge.jsx';

const RECORD_STATUSES = [
  { value: 'SUCCEEDED', label: 'Succeeded (paid)' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
];

/** Record an offline/manual payment. `organization` pre-selects (org Billing tab). */
export function RecordPaymentModal({ organization, onClose, onSaved }) {
  const [organizationId, setOrganizationId] = useState(organization?.id || '');
  const [form, setForm] = useState({ amount: '', currency: 'USD', status: 'SUCCEEDED', reference: '', description: '', paidAt: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const amount = Number(form.amount);
  const valid = organizationId && form.amount !== '' && amount > 0 && /^[A-Z]{3}$/.test(form.currency);

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.billing.payments.record({
        organizationId,
        amount,
        currency: form.currency,
        status: form.status,
        reference: form.reference.trim() || undefined,
        description: form.description.trim() || undefined,
        paidAt: form.status === 'SUCCEEDED' && form.paidAt ? new Date(form.paidAt).toISOString() : undefined,
      });
      toast.success('Payment recorded');
      onSaved?.();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to record payment'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title="Record manual payment"
      description="For payments received outside the platform (bank transfer, invoice, cheque)."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={!valid}>Record payment</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          {organization ? (
            <Input label="Organization" value={organization.name} disabled />
          ) : (
            <OrganizationPicker value={organizationId} onChange={setOrganizationId} required />
          )}
        </div>
        <Input label="Amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={set('amount')} required />
        <Input label="Currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} maxLength={3} />
        <Select label="Status" value={form.status} onChange={set('status')} options={RECORD_STATUSES} />
        {form.status === 'SUCCEEDED' && <Input label="Paid on" type="date" value={form.paidAt} onChange={set('paidAt')} optional hint="Defaults to now" />}
        <Input label="Reference" value={form.reference} onChange={set('reference')} optional hint="Bank transfer / invoice number" />
        <div className="sm:col-span-2">
          <Textarea label="Description" rows={2} value={form.description} onChange={set('description')} optional />
        </div>
      </div>
    </Modal>
  );
}

/** Record a refund of a MANUAL payment (provider payments must be refunded in the provider). */
export function RefundPaymentModal({ payment, onClose, onSaved }) {
  const remaining = Math.round((payment.amount - payment.refundedAmount) * 100) / 100;
  const [amount, setAmount] = useState(String(remaining));
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const n = Number(amount);
  const valid = n > 0 && n <= remaining;

  const refund = async () => {
    setSaving(true);
    try {
      await api.admin.billing.payments.refund(payment.id, { amount: n, reason: reason.trim() || undefined });
      toast.success('Refund recorded');
      onSaved?.();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to record refund'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title="Record refund"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="danger" onClick={refund} loading={saving} disabled={!valid}>Record refund</Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-slate-600">
        Records that {currency(n || 0, payment.currency)} was returned to {payment.organizationName} outside the platform.
        Up to {currency(remaining, payment.currency)} remains refundable.
      </p>
      <div className="space-y-4">
        <Input label="Amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} error={amount && !valid ? `Must be between 0.01 and ${remaining}` : undefined} />
        <Textarea label="Reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} optional />
      </div>
    </Modal>
  );
}

export function PaymentDetailModal({ paymentId, onClose }) {
  const q = useAdminQuery((signal) => api.admin.billing.payments.get(paymentId, { signal }), [paymentId]);
  const p = q.data;
  return (
    <Modal open onClose={onClose} title="Payment details" size="lg">
      {q.loading ? (
        <LoadingState label="Loading payment…" />
      ) : q.error ? (
        <ErrorState error={friendlyError(q.error)} onRetry={q.reload} />
      ) : (
        <DetailList
          items={[
            { label: 'Payment ID', value: <code className="text-xs">{p.id}</code> },
            { label: 'Organization', value: p.organizationName },
            { label: 'Amount', value: currency(p.amount, p.currency) },
            { label: 'Refunded', value: p.refundedAmount ? currency(p.refundedAmount, p.currency) : null },
            { label: 'Net', value: currency(p.netAmount, p.currency) },
            { label: 'Status', value: <StatusBadge status={p.status} domain="payment" /> },
            { label: 'Provider', value: p.provider },
            { label: 'Reference', value: p.providerPaymentId },
            { label: 'Plan', value: p.planName },
            { label: 'Description', value: p.description },
            { label: 'Failure reason', value: p.failureReason },
            { label: 'Paid at', value: dateTime(p.paidAt) },
            { label: 'Refunded at', value: dateTime(p.refundedAt) },
            { label: 'Recorded', value: dateTime(p.createdAt) },
          ]}
        />
      )}
    </Modal>
  );
}
