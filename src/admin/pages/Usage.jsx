import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Gauge, Cpu, DollarSign } from 'lucide-react';
import { api } from '../../api';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { useDebounced } from '../lib/useDebounced.js';
import { rangeParams, RANGE_SELECT_OPTIONS } from '../lib/dateRange.js';
import { cleanParams, currency } from '../lib/format.js';
import { SectionHeader, StatCard, DataTable, FilterBar, AdjustCreditsModal } from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import { Button, Badge, Select } from '../../components/ui';
import { num } from '../../lib/format';

export default function AdminUsage() {
  const { can } = useAdminAccess();
  const canManage = can(P.USAGE_MANAGE);
  const [rangeKey, setRangeKey] = useState('30d');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adjusting, setAdjusting] = useState(null);
  const limit = 10;
  const debouncedSearch = useDebounced(search);
  const range = rangeParams(rangeKey);

  const overview = useAdminQuery((signal) => api.admin.usage.overview(range, { signal }), [rangeKey]);
  const query = useMemo(
    () => cleanParams({ page, limit, search: debouncedSearch.trim(), ...range }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `range` is derived from rangeKey
    [page, debouncedSearch, rangeKey],
  );
  const list = useAdminQuery((signal) => api.admin.usage.list(query, { signal }), [query]);
  const o = overview.data || {};
  const stat = { loading: overview.loading, error: overview.error };

  const columns = [
    { key: 'organizationName', header: 'Organization', render: (r) => (
      <Link to={`/admin/organizations/${r.organizationId}?tab=usage`} className="font-medium text-slate-800 hover:text-brand-700 hover:underline">{r.organizationName}</Link>
    ) },
    { key: 'planName', header: 'Plan', render: (r) => r.planName || <span className="text-slate-400">No plan</span> },
    { key: 'calls', header: 'Calls', align: 'right', render: (r) => num(r.calls) },
    { key: 'minutes', header: 'Minutes', align: 'right', render: (r) => num(r.minutes) },
    { key: 'aiTokens', header: 'AI tokens', align: 'right', render: (r) => num(r.aiTokens) },
    { key: 'cost', header: 'Cost', align: 'right', render: (r) => currency(r.voiceCostUsd + r.aiCostUsd) },
    { key: 'credits', header: 'Credits (this period)', align: 'right', render: (r) => (
      <span className="flex items-center justify-end gap-2">
        <span className={r.credits.remaining < 0 ? 'text-rose-600 font-medium' : ''}>{num(r.credits.remaining)}</span>
        <span className="text-slate-400">/ {num(r.credits.limit)}</span>
        {r.credits.highUsage && <Badge tone="warning" size="sm">High</Badge>}
      </span>
    ) },
    {
      key: 'actions', header: '', align: 'right', render: (r) => canManage && (
        <Button size="sm" variant="secondary" onClick={() => setAdjusting(r)}>Adjust</Button>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Usage & Credits"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Usage & Credits' }]}
        description="Usage for the selected period. Credits are call minutes: plan allowance plus adjustments, measured against the current billing period."
        actions={
          <div className="w-44">
            <Select value={rangeKey} onChange={(e) => { setRangeKey(e.target.value); setPage(1); }} options={RANGE_SELECT_OPTIONS} />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard label="Total Calls" value={num(o.totalCalls)} icon={PhoneCall} iconWrap="bg-orange-50" iconColor="text-orange-600"
          hint={`${num(o.organizationsWithCalls)} organizations calling`} {...stat} />
        <StatCard label="Call Minutes" value={num(o.totalMinutes)} icon={Gauge} iconWrap="bg-blue-50" iconColor="text-blue-600" hint="Credits consumed" {...stat} />
        <StatCard label="AI Tokens" value={num(o.totalAiTokens)} icon={Cpu} iconWrap="bg-violet-50" iconColor="text-violet-600" hint={`${num(o.aiRequests)} AI requests`} {...stat} />
        <StatCard label="Usage Cost" value={currency((o.voiceCostUsd || 0) + (o.aiCostUsd || 0))} icon={DollarSign} iconWrap="bg-rose-50" iconColor="text-rose-600"
          hint={`Voice ${currency(o.voiceCostUsd ?? 0)} · AI ${currency(o.aiCostUsd ?? 0)}`} {...stat} />
      </div>

      <FilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search organizations…" />
      <DataTable
        columns={columns}
        rows={list.data?.data || []}
        rowKey="organizationId"
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle={debouncedSearch ? 'No organizations match your search' : 'No organizations yet'}
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />

      {adjusting && (
        <AdjustCreditsModal
          organizationId={adjusting.organizationId}
          organizationName={adjusting.organizationName}
          onClose={() => setAdjusting(null)}
          onSaved={() => { setAdjusting(null); list.reload(); }}
        />
      )}
    </div>
  );
}
