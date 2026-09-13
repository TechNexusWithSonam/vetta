import { useState } from 'react';
import { Building2, Users, DollarSign, PhoneCall, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { rangeParams, RANGE_OPTIONS } from '../lib/dateRange.js';
import { StatCard, ChartCard, SectionHeader } from '../components';
import { num, money, relativeTime } from '../../lib/format';
import { Select } from '../../components/ui';

function HealthPill() {
  const health = useAsync(() => api.system.health(), []);
  if (health.loading) return <span className="text-xs text-slate-400">Checking system health…</span>;
  const ok = !health.error;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ok ? 'text-emerald-600' : 'text-rose-600'}`}>
      {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {ok ? 'All systems operational' : 'Backend health check failing'}
    </span>
  );
}

export default function AdminDashboard() {
  const [rangeKey, setRangeKey] = useState('30d');
  const params = rangeParams(rangeKey);

  const summary = useAdminAsync(() => api.admin.dashboard.summary(params), [rangeKey]);
  const orgGrowth = useAdminAsync(() => api.admin.analytics.orgGrowth(params), [rangeKey]);
  const revenueTrend = useAdminAsync(() => api.admin.analytics.revenueTrend(params), [rangeKey]);
  const activity = useAdminAsync(() => api.admin.auditLogs.list({ page: 1, limit: 6 }), []);

  const d = summary.data || {};
  const activityItems = activity.data?.items || [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Platform Dashboard"
        description="Cross-tenant overview of Vetta's SaaS business."
        actions={<HealthPill />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Organizations"
          value={num(d.totalOrganizations)}
          icon={Building2}
          iconWrap="bg-indigo-50"
          iconColor="text-indigo-600"
          hint={`${num(d.activeOrganizations)} active`}
          loading={summary.loading}
          isMock={summary.isMock}
        />
        <StatCard
          label="Total Users"
          value={num(d.totalUsers)}
          icon={Users}
          iconWrap="bg-blue-50"
          iconColor="text-blue-600"
          hint="Across all organizations"
          loading={summary.loading}
          isMock={summary.isMock}
        />
        <StatCard
          label="MRR"
          value={money(d.mrr)}
          icon={DollarSign}
          iconWrap="bg-emerald-50"
          iconColor="text-emerald-600"
          hint={`ARR ${money((d.mrr || 0) * 12)}`}
          loading={summary.loading}
          isMock={summary.isMock}
        />
        <StatCard
          label="Calls Today"
          value={num(d.totalCallsToday)}
          icon={PhoneCall}
          iconWrap="bg-orange-50"
          iconColor="text-orange-600"
          hint="Platform-wide"
          loading={summary.loading}
          isMock={summary.isMock}
        />
      </div>

      <div className="flex justify-end">
        <div className="w-44">
          <Select value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} options={Object.entries(RANGE_OPTIONS).map(([k, v]) => ({ value: k, label: v.label }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="New Organizations" loading={orgGrowth.loading} error={orgGrowth.error} onRetry={orgGrowth.reload} isMock={orgGrowth.isMock}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orgGrowth.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={20} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="count" name="New orgs" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend" loading={revenueTrend.loading} error={revenueTrend.error} onRetry={revenueTrend.reload} isMock={revenueTrend.isMock}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrend.data || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={20} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v) => money(v)} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-800">Recent Activity & Alerts</h3>
        </div>
        {activity.loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-10 rounded bg-slate-100 animate-pulse" />)}
          </div>
        ) : activityItems.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No recent admin activity yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activityItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{item.summary}</p>
                  <p className="text-xs text-slate-400">{item.actorEmail}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0 ml-3">{relativeTime(item.at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
