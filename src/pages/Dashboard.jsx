import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  PhoneCall,
  CalendarCheck,
  DollarSign,
  Users,
  GitBranch,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
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
import { num, money, pct, humanize, relativeTime, personName } from '../lib/format';
import { ErrorState } from '../components/ui';

// ---- Date-range selector for the analytics endpoints -----------------------
const RANGES = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 }
};

function rangeParams(key) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - RANGES[key].days);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to), timezone: 'UTC' };
}

const leadName = personName;

// Merge a few recent lists into a single activity stream. Each list is fetched
// independently so one failure doesn't blank the feed.
async function buildActivity() {
  const [leads, campaigns, calls, meetings] = await Promise.allSettled([
    api.leads.list({ page: 1, limit: 6 }),
    api.campaigns.list({ page: 1, limit: 6 }),
    api.voice.calls.list({ page: 1, limit: 6 }),
    api.calendar.meetings.list({ page: 1, limit: 6 })
  ]);

  const rows = (r) =>
    r.status === 'fulfilled'
      ? Array.isArray(r.value)
        ? r.value
        : r.value?.data ?? []
      : [];

  const items = [];
  for (const l of rows(leads)) {
    items.push({
      kind: 'lead',
      at: l.createdAt,
      title: `Lead added: ${leadName(l)}`,
      subtitle: [l.company, humanize(l.status)].filter(Boolean).join(' • ')
    });
  }
  for (const c of rows(campaigns)) {
    items.push({
      kind: 'campaign',
      at: c.createdAt,
      title: `Campaign: ${c.name || 'Untitled'}`,
      subtitle: humanize(c.status)
    });
  }
  for (const v of rows(calls)) {
    items.push({
      kind: 'call',
      at: v.createdAt || v.startedAt || v.updatedAt,
      title: `Call ${humanize(v.status) || 'updated'}`,
      subtitle: v.toNumber || v.phoneNumber || v.campaignId || ''
    });
  }
  for (const m of rows(meetings)) {
    items.push({
      kind: 'meeting',
      at: m.createdAt || m.startTime || m.startTimeIso,
      title: m.title || 'Meeting booked',
      subtitle: humanize(m.status)
    });
  }

  return items
    .filter((i) => i.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 7);
}

const ACTIVITY_ICONS = {
  lead: { Icon: Users, wrap: 'bg-indigo-100', color: 'text-indigo-600' },
  campaign: { Icon: GitBranch, wrap: 'bg-emerald-100', color: 'text-emerald-600' },
  call: { Icon: PhoneCall, wrap: 'bg-orange-100', color: 'text-orange-600' },
  meeting: { Icon: CalendarCheck, wrap: 'bg-blue-100', color: 'text-blue-600' }
};

// ---- Small building blocks ------------------------------------------
function KpiCard({ label, value, icon, iconWrap, iconColor, hint, loading }) {
  const Icon = icon;
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          {loading ? (
            <div className="h-9 w-28 rounded bg-slate-100 animate-pulse" />
          ) : (
            <h2 className="text-3xl font-bold text-slate-900 truncate">{value}</h2>
          )}
        </div>
        <div className={`p-2 rounded-lg ${iconWrap}`}>
          <Icon className={iconColor} size={24} />
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-400 truncate">
        {loading ? <span className="inline-block h-4 w-32 rounded bg-slate-100 animate-pulse" /> : hint}
      </div>
    </div>
  );
}

// ---- Page --------------------------------------------------------------
export default function Dashboard() {
  const [rangeKey, setRangeKey] = useState('30d');
  const params = useMemo(() => rangeParams(rangeKey), [rangeKey]);

  const exec = useAsync(() => api.analytics.dashboard.executive(params), [rangeKey]);
  const funnel = useAsync(() => api.analytics.funnel(params), [rangeKey]);
  const activity = useAsync(buildActivity, []);

  const d = exec.data || {};
  const funnelData = Array.isArray(funnel.data) ? funnel.data : [];
  const activityItems = Array.isArray(activity.data) ? activity.data : [];

  return (
    <div className="space-y-6">
      {exec.error && <ErrorState error={exec.error} onRetry={exec.reload} />}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label="AI + Voice Spend"
          value={money((d.aiCostUsd || 0) + (d.voiceCostUsd || 0))}
          icon={DollarSign}
          iconWrap="bg-emerald-50"
          iconColor="text-emerald-600"
          hint={`AI ${money(d.aiCostUsd)} · Voice ${money(d.voiceCostUsd)}`}
          loading={exec.loading}
        />
        <KpiCard
          label="Connect Rate"
          value={pct(d.connectRate)}
          icon={TrendingUp}
          iconWrap="bg-indigo-50"
          iconColor="text-indigo-600"
          hint={`Qualification ${pct(d.qualificationRate)}`}
          loading={exec.loading}
        />
        <KpiCard
          label="Meetings Booked"
          value={num(d.meetingsBooked)}
          icon={CalendarCheck}
          iconWrap="bg-blue-50"
          iconColor="text-blue-600"
          hint={`Win rate ${pct(d.winRate)}`}
          loading={exec.loading}
        />
        <KpiCard
          label="Calls Placed"
          value={num(d.callsPlaced)}
          icon={PhoneCall}
          iconWrap="bg-orange-50"
          iconColor="text-orange-600"
          hint={`${num(d.leadsResearched)} of ${num(d.totalLeads)} leads researched`}
          loading={exec.loading}
        />
      </div>

      {/* Main Content Grid (Funnel + Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Conversion Funnel</h3>
            <select
              value={rangeKey}
              onChange={(e) => setRangeKey(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-1.5"
            >
              {Object.entries(RANGES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="h-80 w-full">
            {funnel.loading ? (
              <div className="h-full w-full rounded-lg bg-slate-50 animate-pulse" />
            ) : funnel.error ? (
              <div className="h-full flex items-center justify-center">
                <ErrorState error={funnel.error} onRetry={funnel.reload} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value, _name, entry) => [
                      `${num(value)} leads${
                        entry?.payload?.conversionToNextPct != null
                          ? ` · ${pct(entry.payload.conversionToNextPct)} to next`
                          : ''
                      }`,
                      'Stage'
                    ]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {funnelData.map((_, i) => (
                      <Cell key={i} fill={`rgba(99, 102, 241, ${1 - i * 0.1})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Latest Activity</h3>

          {activity.loading ? (
            <div className="space-y-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-slate-100 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.error ? (
            <ErrorState error={activity.error} onRetry={activity.reload} />
          ) : activityItems.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No recent activity yet.</p>
          ) : (
            <div className="space-y-6">
              {activityItems.map((item, i) => {
                const { Icon, wrap, color } = ACTIVITY_ICONS[item.kind] || ACTIVITY_ICONS.lead;
                return (
                  <div key={i} className="flex items-start space-x-3">
                    <div className={`h-8 w-8 rounded-full ${wrap} flex items-center justify-center shrink-0`}>
                      <Icon size={14} className={color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-slate-500 mt-1 truncate">{item.subtitle}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{relativeTime(item.at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => activity.reload()}
            className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCcw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
