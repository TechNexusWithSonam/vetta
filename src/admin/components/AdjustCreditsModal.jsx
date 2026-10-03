import { useState } from 'react';
import { api } from '../../api';
import { Button, Input, Modal, Textarea, useToast } from '../../components/ui';
import { adminErrorMessage } from '../lib/adminErrors.js';

/** ± call-minute credit adjustment for the org's current billing period (reason required, audit-logged server-side). */
export function AdjustCreditsModal({ organizationId, organizationName, onClose, onSaved }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const n = Number(amount);
  const valid = amount !== '' && Number.isInteger(n) && n !== 0 && reason.trim().length > 0;

  const apply = async () => {
    setSaving(true);
    try {
      await api.admin.usage.adjustCredits(organizationId, { amount: n, reason: reason.trim() });
      toast.success('Credits adjusted');
      onSaved?.();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to adjust credits'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title={`Adjust credits — ${organizationName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={apply} loading={saving} disabled={!valid}>Apply</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Minutes"
          type="number"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          hint="Whole minutes. Positive adds credits, negative deducts. Applies to the current billing period."
          required
        />
        <Textarea label="Reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} required />
      </div>
    </Modal>
  );
}

export default AdjustCreditsModal;
