import { useState } from 'react';
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../../api';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { rangeParams, RANGE_OPTIONS } from '../lib/dateRange.js';
import { SectionHeader, StatCard, ChartCard } from '../components';
import { Select } from '../../components/ui';
import { num, money, pct } from '../../lib/format';

const PIE_COLORS = ['#4f46e5', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b'];

export default function AdminAnalytics() {
  const [rangeKey, setRangeKey] = useState('30d');
  const params = rangeParams(rangeKey);

  const overview = useAdminAsync(() => api.admin.analytics.platformOverview(params), [rangeKey]);
  const churn = useAdminAsync(() => api.admin.analytics.churnTrend(), []);
  const callVolume = useAdminAsync(() => api.admin.analytics.callVolumeTrend(), []);
  const planDist = useAdminAsync(() => api.admin.analytics.planDistribution(), []);

  const o = overview.data || {};
  const arpu = o.totalOrgs ? (o.mrr || 0) / o.totalOrgs : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Analytics' }]}
        actions={
          <div className="w-44">
            <Select value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} options={Object.entries(RANGE_OPTIONS).map(([k, v]) => ({ value: k, label: v.label }))} />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="MRR" value={money(o.mrr)} icon={DollarSign} iconWrap="bg-emerald-50" iconColor="text-emerald-600" hint={`ARR ${money((o.mrr || 0) * 12)}`} loading={overview.loading} isMock={overview.isMock} />
        <StatCard label="Customer Growth" value={pct(o.growthPct)} icon={TrendingUp} iconWrap="bg-indigo-50" iconColor="text-indigo-600" hint={`${num(o.totalOrgs)} total orgs`} loading={overview.loading} isMock={overview.isMock} />
        <StatCard label="ARPU" value={money(arpu)} icon={Users} iconWrap="bg-blue-50" iconColor="text-blue-600" hint="Avg. revenue per org" loading={overview.loading} isMock={overview.isMock} />
        <StatCard label="Active Organizations" value={num(o.activeOrgs)} icon={Building2} iconWrap="bg-orange-50" iconColor="text-orange-600" hint={`of ${num(o.totalOrgs)} total`} loading={overview.loading} isMock={overview.isMock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Call Volume" loading={callVolume.loading} error={callVolume.error} onRetry={callVolume.reload} isMock={callVolume.isMock}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={callVolume.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={20} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="calls" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Churn Trend" loading={churn.loading} error={churn.error} onRetry={churn.reload} isMock={churn.isMock}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churn.data || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={20} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="churned" stroke="#e11d48" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Plan Distribution" loading={planDist.loading} error={planDist.error} onRetry={planDist.reload} isMock={planDist.isMock} height={280}>
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
