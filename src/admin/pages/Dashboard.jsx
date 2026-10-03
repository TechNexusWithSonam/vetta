import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, DollarSign, PhoneCall, History, CheckCircle2, XCircle, Target, Gauge, Cpu,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { rangeParams, RANGE_SELECT_OPTIONS } from '../lib/dateRange.js';
import { friendlyError } from '../lib/adminErrors.js';
import { percent } from '../lib/format.js';
import { StatCard, ChartCard, SectionHeader } from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import { num, money, relativeTime } from '../../lib/format';
import { ErrorState, Select } from '../../components/ui';

const TOOLTIP_STYLE = { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
const hasValues = (rows, key) => (rows || []).some((r) => Number(r[key]) > 0);

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

function RecentActivity() {
  const activity = useAdminQuery((signal) => api.admin.auditLogs.list({ page: 1, limit: 8 }, { signal }), []);
  const items = activity.data?.data || [];
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
        </div>
        <Link to="/admin/audit-logs" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all</Link>
      </div>
      {activity.loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-10 rounded bg-slate-100 animate-pulse" />)}
        </div>
      ) : activity.error ? (
        <ErrorState error={friendlyError(activity.error)} onRetry={activity.reload} />
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No recorded activity yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">{item.summary}</p>
                <p className="text-xs text-slate-400 truncate">
                  {item.actorEmail}
                  {item.organizationName ? ` · ${item.organizationName}` : ''}
                </p>
              </div>
              <span className="text-xs text-slate-400 shrink-0 ml-3">{relativeTime(item.at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { can } = useAdminAccess();
  const [rangeKey, setRangeKey] = useState('30d');
  const params = rangeParams(rangeKey);

  const summary = useAdminQuery((signal) => api.admin.dashboard.summary(params, { signal }), [rangeKey]);
  const trends = useAdminQuery((signal) => api.admin.dashboard.trends(params, { signal }), [rangeKey]);

  const d = summary.data || {};
  const calls = d.calls || {};
  const usage = d.usage || {};
  const t = trends.data || {};
  const rangeLabel = RANGE_SELECT_OPTIONS.find((o) => o.value === rangeKey)?.label.toLowerCase();
  const stat = { loading: summary.loading, error: summary.error };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Platform Dashboard"
        description="Cross-tenant overview of Vetta's SaaS business."
        actions={
          <div className="flex items-center gap-4">
            <HealthPill />
            <div className="w-44">
              <Select value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} options={RANGE_SELECT_OPTIONS} />
            </div>
          </div>
        }
      />

      {summary.error && <ErrorState error={friendlyError(summary.error)} onRetry={summary.reload} title="Summary" />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Organizations" value={num(d.totalOrgs)} icon={Building2} iconWrap="bg-indigo-50" iconColor="text-indigo-600"
          hint={`${num(d.activeOrgs)} active · ${num(d.newOrgs)} new (${rangeLabel})`} {...stat} />
        <StatCard label="Total Users" value={num(d.totalUsers)} icon={Users} iconWrap="bg-blue-50" iconColor="text-blue-600"
          hint={`${num(d.activeUsers)} active · ${num(d.usersActiveInRange)} signed in`} {...stat} />
        <StatCard label="MRR" value={money(d.mrr)} icon={DollarSign} iconWrap="bg-emerald-50" iconColor="text-emerald-600"
          hint={`ARR ${money(d.arr)} · ${num(d.payingSubscriptions)} paying`} {...stat} />
        <StatCard label="Calls Today" value={num(d.callsToday)} icon={PhoneCall} iconWrap="bg-orange-50" iconColor="text-orange-600"
          hint={`${num(calls.total)} calls ${rangeLabel}`} {...stat} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Call Success Rate" value={percent(calls.successRatePct)} icon={Target} iconWrap="bg-teal-50" iconColor="text-teal-600"
          hint={`${num(calls.completed)} completed · ${num(calls.failed)} failed`} {...stat} />
        <StatCard label="Net Revenue" value={money(d.revenue)} icon={DollarSign} iconWrap="bg-emerald-50" iconColor="text-emerald-600"
          hint={`Collected, ${rangeLabel}`} {...stat} />
        <StatCard label="Call Minutes" value={num(usage.callMinutes)} icon={Gauge} iconWrap="bg-sky-50" iconColor="text-sky-600"
          hint={`Voice cost ${money(usage.voiceCostUsd)}`} {...stat} />
        <StatCard label="AI Tokens" value={num(usage.aiTokens)} icon={Cpu} iconWrap="bg-violet-50" iconColor="text-violet-600"
          hint={`AI cost ${money(usage.aiCostUsd)}`} {...stat} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="New Organizations" loading={trends.loading} error={trends.error} onRetry={trends.reload} empty={!hasValues(t.orgGrowth, 'count')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={t.orgGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={20} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" name="New orgs" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend" loading={trends.loading} error={trends.error} onRetry={trends.reload} empty={!hasValues(t.revenueTrend, 'revenue')}
          emptyText="No payments recorded in this period.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={t.revenueTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={20} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => money(v)} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => money(v)} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Call Volume" loading={trends.loading} error={trends.error} onRetry={trends.reload} empty={!hasValues(t.callVolume, 'calls')}
        emptyText="No calls placed in this period.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={t.callVolume || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={20} />
            <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            <Bar dataKey="completed" name="Completed" stackId="c" fill="#10b981" />
            <Bar dataKey="failed" name="Failed / no answer" stackId="c" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {can(P.AUDIT_LOGS_VIEW) && <RecentActivity />}
    </div>
  );
}
