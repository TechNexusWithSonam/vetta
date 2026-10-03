import React, { useMemo, useState } from 'react';
import { Users, PhoneCall, Clock, Calendar, BarChart2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, EmptyState, Skeleton } from '../components/ui';
import { num, pct, humanize } from '../lib/format';

const TIMEFRAMES = {
  '7d': { label: '7d', days: 7 },
  '30d': { label: '30d', days: 30 },
  qtd: { label: 'QTD', days: 90 }
};

function rangeParams(key) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - TIMEFRAMES[key].days);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to), timezone: 'UTC' };
}

function KpiCard({ icon, label, value, sub }) {
  const Icon = icon;
  return (
    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center space-x-2 text-slate-600 mb-3">
        <Icon size={16} />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
      <div className="text-xs font-medium text-slate-400">{sub}</div>
    </div>
  );
}

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('30d');
  const params = useMemo(() => rangeParams(timeframe), [timeframe]);

  const exec = useAsync(() => api.analytics.dashboard.executive(params), [timeframe]);
  const voice = useAsync(() => api.analytics.dashboard.voice(params), [timeframe]);
  const campaigns = useAsync(async () => {
    const res = await api.campaigns.list({ page: 1, limit: 5 });
    const rows = res?.data ?? [];
    const withAnalytics = await Promise.all(
      rows.map(async (c) => {
        try {
          const a = await api.campaigns.analytics(c.id);
          return { ...c, analytics: a };
        } catch {
          return { ...c, analytics: null };
        }
      })
    );
    return withAnalytics;
  }, []);

  const d = exec.data ?? {};
  const v = voice.data ?? {};
  const outcomes = Array.isArray(v.outcomes) ? v.outcomes : [];
  const outcomeData = outcomes.map((o) => ({
    label: humanize(o.outcome || o.status || o.label || 'Unknown'),
    count: Number(o.count ?? o.value ?? 0)
  }));

  const talkHours =
    v.avgDurationSeconds != null && v.callsPlaced
      ? ((v.avgDurationSeconds * v.callsPlaced) / 3600).toFixed(0)
      : '0';

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Performance across campaigns, calls and pipeline</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          {Object.entries(TIMEFRAMES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setTimeframe(key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                timeframe === key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {exec.error && <ErrorState error={exec.error} onRetry={exec.reload} />}

      <div className="flex flex-1 flex-col gap-6 min-h-0 overflow-y-auto pb-8">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Call outcomes */}
          <div className="flex-[1.4] bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Call outcomes</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {num(v.callsPlaced)} calls · {pct(v.connectRate)} connect rate
                </p>
              </div>
              <BarChart2 size={18} className="text-slate-400" />
            </div>
            <div className="p-6 flex-1 min-h-[16rem]">
              {voice.loading ? (
                <Skeleton className="h-full w-full" />
              ) : voice.error ? (
                <ErrorState error={voice.error} onRetry={voice.reload} compact />
              ) : outcomeData.length === 0 ? (
                <EmptyState icon={PhoneCall} title="No call data in this window" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outcomeData} margin={{ top: 8, right: 8, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {outcomeData.map((_, i) => (
                        <Cell key={i} fill={`rgba(99, 102, 241, ${1 - i * 0.12})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top campaigns */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Campaigns</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              {campaigns.loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : campaigns.error ? (
                <div className="p-4">
                  <ErrorState error={campaigns.error} onRetry={campaigns.reload} compact />
                </div>
              ) : (campaigns.data ?? []).length === 0 ? (
                <EmptyState icon={BarChart2} title="No campaigns yet" />
              ) : (
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {(campaigns.data ?? []).map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <b className="block text-slate-800 truncate max-w-[12rem]">{c.name}</b>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            {num(c.analytics?.totalLeads ?? c.totalLeads)} leads · {humanize(c.status)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <b className="block text-indigo-600">{pct(c.analytics?.meetingRate)}</b>
                          <span className="text-xs text-slate-500 mt-0.5 block">meeting rate</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Bottom KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exec.loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          ) : (
            <>
              <KpiCard
                icon={Users}
                label="Leads processed"
                value={num(d.totalLeads)}
                sub={`${num(d.leadsResearched)} researched`}
              />
              <KpiCard
                icon={PhoneCall}
                label="Calls placed"
                value={num(d.callsPlaced)}
                sub={`${pct(d.connectRate)} connect rate`}
              />
              <KpiCard
                icon={Clock}
                label="Talk time"
                value={
                  <>
                    {talkHours}
                    <span className="text-xl">h</span>
                  </>
                }
                sub={
                  v.avgDurationSeconds != null
                    ? `${Math.round(v.avgDurationSeconds)}s avg / call`
                    : 'no call data'
                }
              />
              <KpiCard
                icon={Calendar}
                label="Meetings booked"
                value={num(d.meetingsBooked)}
                sub={`${pct(d.winRate)} win rate`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
