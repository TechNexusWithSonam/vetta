import { useState } from 'react';
import { Gauge, PhoneCall, Cpu, DollarSign } from 'lucide-react';
import { api } from '../../../../api';
import { useAdminQuery } from '../../../lib/useAdminQuery.js';
import { friendlyError } from '../../../lib/adminErrors.js';
import { AdjustCreditsModal, DataTable, StatCard } from '../../../components';
import { useAdminAccess } from '../../../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../../../rbac/permissions.js';
import { Badge, Button, ErrorState } from '../../../../components/ui';
import { num, money, dateTime } from '../../../../lib/format';

export default function UsageTab({ org, onOrgChanged }) {
  const { can } = useAdminAccess();
  const usage = useAdminQuery((signal) => api.admin.usage.ofOrganization(org.id, { signal }), [org.id]);
  const [adjusting, setAdjusting] = useState(false);
  const d = usage.data || {};
  const c = d.credits;
  const stat = { loading: usage.loading, error: usage.error };

  return (
    <div className="space-y-6">
      {usage.error && <ErrorState error={friendlyError(usage.error)} onRetry={usage.reload} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Calls this period" value={num(d.calls)} icon={PhoneCall} iconWrap="bg-orange-50" iconColor="text-orange-600"
          hint={c ? `Since ${dateTime(c.periodStart)}` : ''} {...stat} />
        <StatCard label="Minutes used" value={num(d.minutes)} icon={Gauge} iconWrap="bg-blue-50" iconColor="text-blue-600" hint="Connected call time" {...stat} />
        <StatCard label="AI tokens" value={num(d.aiTokens)} icon={Cpu} iconWrap="bg-violet-50" iconColor="text-violet-600" hint={`AI cost ${money(d.aiCostUsd)}`} {...stat} />
        <StatCard label="Voice cost" value={money(d.voiceCostUsd)} icon={DollarSign} iconWrap="bg-rose-50" iconColor="text-rose-600" hint="Recorded provider cost" {...stat} />
      </div>

      {c && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              Credits (call minutes)
              {c.highUsage && <Badge tone="warning" size="sm">High usage</Badge>}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {num(c.remaining)} of {num(c.limit)} remaining — {num(c.planIncludedMinutes)} from {d.planName || 'no plan'}
              {c.adjustments ? `, ${c.adjustments > 0 ? '+' : ''}${num(c.adjustments)} adjusted` : ''}. Period {dateTime(c.periodStart)} – {dateTime(c.periodEnd)}.
            </p>
          </div>
          {can(P.USAGE_MANAGE) && <Button variant="secondary" onClick={() => setAdjusting(true)}>Adjust credits</Button>}
        </div>
      )}

      {!usage.loading && !usage.error && (
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Recent adjustments</h3>
          <DataTable
            columns={[
              { key: 'createdAt', header: 'When', render: (a) => dateTime(a.createdAt) },
              { key: 'amount', header: 'Minutes', align: 'right', render: (a) => `${a.amount > 0 ? '+' : ''}${num(a.amount)}` },
              { key: 'reason', header: 'Reason' },
              { key: 'createdByEmail', header: 'By', render: (a) => a.createdByEmail || '—' },
            ]}
            rows={d.recentAdjustments || []}
            emptyTitle="No credit adjustments yet"
          />
        </div>
      )}

      {adjusting && (
        <AdjustCreditsModal
          organizationId={org.id}
          organizationName={org.name}
          onClose={() => setAdjusting(false)}
          onSaved={() => { setAdjusting(false); usage.reload(); onOrgChanged?.(); }}
        />
      )}
    </div>
  );
}
