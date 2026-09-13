import { useState } from 'react';
import { Gauge, PhoneCall, Cpu } from 'lucide-react';
import { api } from '../../../../api';
import { useAuth } from '../../../../context/useAuth';
import { useAdminAsync } from '../../../lib/useAdminAsync.js';
import { logAdminAction } from '../../../lib/auditLog.js';
import { StatCard } from '../../../components';
import { Button, Input, Modal, useToast } from '../../../../components/ui';
import { num } from '../../../../lib/format';

export default function UsageTab({ org, onOrgChanged }) {
  const usage = useAdminAsync(() => api.admin.organizations.usageOf(org.id), [org.id]);
  const [adjusting, setAdjusting] = useState(false);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  const d = usage.data || {};

  const adjustCredits = async () => {
    setSaving(true);
    try {
      await api.admin.usage.credits.adjust(org.id, { amount: Number(amount), reason: 'Manual admin adjustment' });
      await logAdminAction({
        action: 'usage.credits_adjust', entityType: 'organization', entityId: org.id, organizationId: org.id,
        summary: `Adjusted credits for ${org.name} by ${amount}`, metadata: { amount }, actor: user,
      });
      toast.success('Credits adjusted');
      setAdjusting(false);
      setAmount('');
      usage.reload();
      onOrgChanged?.();
    } catch (err) {
      toast.error(err?.message || 'Failed to adjust credits');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Calls this month" value={num(d.calls)} icon={PhoneCall} iconWrap="bg-orange-50" iconColor="text-orange-600" loading={usage.loading} isMock={usage.isMock} />
        <StatCard label="Minutes used" value={num(d.minutes)} icon={Gauge} iconWrap="bg-blue-50" iconColor="text-blue-600" loading={usage.loading} isMock={usage.isMock} />
        <StatCard label="AI tokens" value={num(d.aiTokens)} icon={Cpu} iconWrap="bg-violet-50" iconColor="text-violet-600" loading={usage.loading} isMock={usage.isMock} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Credits</h3>
          <p className="text-sm text-slate-500 mt-1">
            {num(d.creditsRemaining)} of {num(d.creditsLimit)} remaining
            {d.highUsage && <span className="text-amber-600 font-medium"> · High usage</span>}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setAdjusting(true)}>Adjust credits</Button>
      </div>

      <Modal
        open={adjusting}
        onClose={() => setAdjusting(false)}
        title="Adjust credits"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjusting(false)} disabled={saving}>Cancel</Button>
            <Button onClick={adjustCredits} loading={saving} disabled={!amount}>Apply</Button>
          </>
        }
      >
        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          hint="Positive to add credits, negative to deduct."
        />
      </Modal>
    </div>
  );
}
