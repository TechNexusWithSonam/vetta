import { useState } from 'react';
import { Building2, Users, DollarSign, TrendingUp, TrendingDown, Target, CalendarCheck, UserCheck } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../../api';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { rangeParams, RANGE_SELECT_OPTIONS } from '../lib/dateRange.js';
import { friendlyError } from '../lib/adminErrors.js';
import { percent } from '../lib/format.js';
import { SectionHeader, StatCard, ChartCard } from '../components';
import { ErrorState, Select } from '../../components/ui';
import { num, money } from '../../lib/format';

const PIE_COLORS = ['#4f46e5', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];
const TOOLTIP_STYLE = { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
const AXIS = { axisLine: false, tickLine: false, tick: { fill: '#64748b', fontSize: 11 } };
const hasValues = (rows, key) => (rows || []).some((r) => Number(r[key]) > 0);

export default function AdminAnalytics() {
  const [rangeKey, setRangeKey] = useState('30d');
  const params = rangeParams(rangeKey);

  // Every series is aggregated server-side for the selected range and refetches when it changes.
  const overview = useAdminQuery((signal) => api.admin.analytics.overview(params, { signal }), [rangeKey]);
  const orgGrowth = useAdminQuery((signal) => api.admin.analytics.orgGrowth(params, { signal }), [rangeKey]);
  const revenue = useAdminQuery((signal) => api.admin.analytics.revenueTrend(params, { signal }), [rangeKey]);
  const churn = useAdminQuery((signal) => api.admin.analytics.churnTrend(params, { signal }), [rangeKey]);
  const callVolume = useAdminQuery((signal) => api.admin.analytics.callVolumeTrend(params, { signal }), [rangeKey]);
  const planDist = useAdminQuery((signal) => api.admin.analytics.planDistribution({ signal }), []);

  const o = overview.data || {};
  const calls = o.calls || {};
  const stat = { loading: overview.loading, error: overview.error };
  const chart = (q) => ({ loading: q.loading, error: q.error, onRetry: q.reload });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Analytics' }]}
        actions={
          <div className="w-44">
            <Select value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} options={RANGE_SELECT_OPTIONS} />
          </div>
        }
      />

      {overview.error && <ErrorState error={friendlyError(overview.error)} onRetry={overview.reload} title="Overview" />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="MRR" value={money(o.mrr)} icon={DollarSign} iconWrap="bg-emerald-50" iconColor="text-emerald-600" hint={`ARR ${money(o.arr)}`} {...stat} />
        <StatCard label="New Organizations" value={num(o.newOrgs)} icon={TrendingUp} iconWrap="bg-indigo-50" iconColor="text-indigo-600"
          hint={o.growthPct === null ? 'No prior-period data' : `${o.growthPct >= 0 ? '+' : ''}${percent(o.growthPct)} vs previous period`} {...stat} />
        <StatCard label="ARPU" value={money(o.arpu)} icon={Users} iconWrap="bg-blue-50" iconColor="text-blue-600" hint={`${num(o.payingSubscriptions)} paying · ${num(o.trialingSubscriptions)} trialing`} {...stat} />
        <StatCard label="Active Organizations" value={num(o.activeOrgs)} icon={Building2} iconWrap="bg-orange-50" iconColor="text-orange-600" hint={`of ${num(o.totalOrgs)} total`} {...stat} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Churn Rate" value={percent(o.churnRatePct)} icon={TrendingDown} iconWrap="bg-rose-50" iconColor="text-rose-600" hint={`${num(o.churnedSubscriptions)} cancelled in period`} {...stat} />
        <StatCard label="Active Users" value={num(o.usersActiveInRange)} icon={UserCheck} iconWrap="bg-sky-50" iconColor="text-sky-600" hint={`Signed in during period · ${num(o.totalUsers)} total`} {...stat} />
        <StatCard label="Call Success Rate" value={percent(calls.successRatePct)} icon={Target} iconWrap="bg-teal-50" iconColor="text-teal-600" hint={`${num(calls.total)} calls in period`} {...stat} />
        <StatCard label="Meetings Booked" value={num(calls.meetingsBooked)} icon={CalendarCheck} iconWrap="bg-violet-50" iconColor="text-violet-600" hint={`Net revenue ${money(o.revenue)}`} {...stat} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Call Volume" {...chart(callVolume)} empty={!hasValues(callVolume.data, 'calls')} emptyText="No calls in this period.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={callVolume.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" {...AXIS} minTickGap={20} />
              <YAxis {...AXIS} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <Bar dataKey="completed" name="Completed" stackId="c" fill="#10b981" />
              <Bar dataKey="failed" name="Failed / no answer" stackId="c" fill="#f43f5e" />
              <Bar dataKey="calls" name="All calls" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend" {...chart(revenue)} empty={!hasValues(revenue.data, 'revenue')} emptyText="No payments in this period.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue.data || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" {...AXIS} minTickGap={20} />
              <YAxis {...AXIS} tickFormatter={(v) => money(v)} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => money(v)} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New Organizations" {...chart(orgGrowth)} empty={!hasValues(orgGrowth.data, 'count')} emptyText="No sign-ups in this period.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orgGrowth.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" {...AXIS} minTickGap={20} />
              <YAxis {...AXIS} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" name="New orgs" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Churn Trend" {...chart(churn)} empty={!hasValues(churn.data, 'churned')} emptyText="No cancellations in this period.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churn.data || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" {...AXIS} minTickGap={20} />
              <YAxis {...AXIS} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="churned" name="Cancelled" stroke="#e11d48" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Plan Distribution (live subscriptions)" {...chart(planDist)} empty={(planDist.data || []).length === 0} emptyText="No live subscriptions yet." height={280}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={planDist.data || []} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={90} label>
              {(planDist.data || []).map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
