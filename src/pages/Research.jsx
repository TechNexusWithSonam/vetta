import React, { useMemo, useState } from 'react';
import {
  BrainCircuit,
  Search,
  Building,
  User,
  RefreshCcw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, EmptyState, Skeleton } from '../components/ui';
import { humanize, relativeTime, personName, initials, money, num } from '../lib/format';

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  RUNNING: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700'
};

function ResultView({ result }) {
  if (result == null) return <p className="text-sm text-slate-500">No result payload yet.</p>;
  if (typeof result === 'string') {
    return <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result}</p>;
  }
  // Object — surface common sections if present, otherwise pretty-print.
  const known = ['summary', 'signals', 'triggers', 'persona', 'angle', 'recommendedAngle', 'tokens'];
  const hasKnown = known.some((k) => k in result);
  if (!hasKnown) {
    return (
      <pre className="text-xs bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  }
  return (
    <div className="space-y-4">
      {result.summary && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Summary</h4>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
        </div>
      )}
      {(result.angle || result.recommendedAngle) && (
        <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-4">
          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Recommended Angle</h4>
          <p className="text-sm text-indigo-900">{result.angle || result.recommendedAngle}</p>
        </div>
      )}
      {Array.isArray(result.signals || result.triggers) && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Signals</h4>
          <ul className="space-y-1.5">
            {(result.signals || result.triggers).map((s, i) => (
              <li key={i} className="text-sm text-slate-700">
                • {typeof s === 'string' ? s : JSON.stringify(s)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.tokens && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Personalization Tokens</h4>
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <tbody className="divide-y divide-slate-200 bg-white">
                {Object.entries(result.tokens).map(([k, v]) => (
                  <tr key={k}>
                    <td className="px-4 py-2 font-mono text-xs text-indigo-600">{`{{${k}}}`}</td>
                    <td className="px-4 py-2 text-slate-600">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Research() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const jobs = useAsync(() => api.research.list({ page: 1, limit: 50 }), []);
  const leadsById = useAsync(async () => {
    const res = await api.leads.list({ page: 1, limit: 100 });
    const map = {};
    for (const l of res?.data ?? []) map[l.id] = l;
    return map;
  }, []);

  const jobRows = useMemo(() => jobs.data?.data ?? [], [jobs.data]);
  const leadMap = useMemo(() => leadsById.data ?? {}, [leadsById.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobRows;
    return jobRows.filter((j) => {
      const lead = leadMap[j.leadId];
      const hay = `${personName(lead)} ${lead?.company ?? ''} ${j.type} ${j.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [jobRows, leadMap, search]);

  // Effective selection without a state-syncing effect.
  const activeId = selectedId ?? jobRows[0]?.id ?? null;

  const detail = useAsync(
    () => (activeId ? api.research.get(activeId) : Promise.resolve(null)),
    [activeId]
  );
  const providerLogs = useAsync(
    () => (activeId ? api.research.providerLogs(activeId).catch(() => []) : Promise.resolve([])),
    [activeId]
  );

  const refreshJobs = () => {
    setRefreshing(true);
    Promise.allSettled([jobs.reload(), leadsById.reload()]).finally(() => setRefreshing(false));
  };

  const job = detail.data;
  const jobLead = job ? leadMap[job.leadId] : null;
  const logs = Array.isArray(providerLogs.data) ? providerLogs.data : [];
  const totalCost = logs.reduce((sum, l) => sum + Number(l.costUsd || l.cost || 0), 0);
  const totalTokens = logs.reduce(
    (sum, l) => sum + Number(l.totalTokens || (l.inputTokens || 0) + (l.outputTokens || 0) || 0),
    0
  );

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Intelligence</h2>
          <p className="text-sm text-slate-500 mt-1">
            AI research jobs, provider runs, and generated summaries.
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts or prospects..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left: Job Queue */}
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Research Jobs</h3>
            <button
              onClick={refreshJobs}
              disabled={refreshing}
              title="Refresh"
              className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
            >
              <RefreshCcw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {jobs.loading && (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            )}

            {jobs.error && (
              <div className="p-4">
                <ErrorState error={jobs.error} onRetry={jobs.reload} compact />
              </div>
            )}

            {!jobs.loading && !jobs.error && filtered.length === 0 && (
              <EmptyState icon={BrainCircuit} title="No research jobs" hint="Start research on a lead to see it here." />
            )}

            {filtered.map((j) => {
              const lead = leadMap[j.leadId];
              const active = j.id === activeId;
              return (
                <button
                  key={j.id}
                  onClick={() => setSelectedId(j.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    active ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-semibold ${active ? 'text-slate-900' : 'text-slate-700'}`}>
                      {lead?.company || personName(lead) || 'Unknown lead'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        STATUS_STYLES[j.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {humanize(j.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{humanize(j.type)}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{relativeTime(j.createdAt)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detail */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {!activeId ? (
            <EmptyState icon={BrainCircuit} title="Select a research job" />
          ) : detail.loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detail.error ? (
            <div className="p-6">
              <ErrorState error={detail.error} onRetry={detail.reload} />
            </div>
          ) : !job ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {initials(jobLead?.company || personName(jobLead))}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {jobLead?.company || personName(jobLead) || 'Unknown lead'}
                    </h2>
                    <p className="text-sm text-slate-500 flex items-center mt-1">
                      <User size={14} className="mr-1" /> {personName(jobLead)}
                      <span className="mx-2 text-slate-300">|</span>
                      <Building size={14} className="mr-1" /> {humanize(job.type)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded ${
                      STATUS_STYLES[job.status] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {job.status === 'PENDING' || job.status === 'RUNNING' ? (
                      <Loader2 size={12} className="inline mr-1 animate-spin" />
                    ) : null}
                    {humanize(job.status)}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">
                    {job.completedAt ? `Completed ${relativeTime(job.completedAt)}` : `Started ${relativeTime(job.createdAt)}`}
                  </p>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Meta strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    ['Provider', job.provider || '—'],
                    ['Model', job.model || '—'],
                    ['Attempts', num(job.attempts)],
                    ['Prompt', `${job.promptKey || '—'} v${job.promptVersion ?? '—'}`]
                  ].map(([label, value]) => (
                    <div key={label} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {job.status === 'FAILED' && job.errorMessage && (
                  <div className="flex items-start space-x-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>{job.errorMessage}</span>
                  </div>
                )}

                {/* Provider cost */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3 text-slate-700">
                    <BrainCircuit size={18} />
                    <h3 className="font-bold">Provider Usage</h3>
                  </div>
                  {providerLogs.loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : logs.length === 0 ? (
                    <p className="text-sm text-slate-500">No provider runs recorded.</p>
                  ) : (
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-slate-500">Runs</span>
                        <p className="font-bold text-slate-800">{logs.length}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Tokens</span>
                        <p className="font-bold text-slate-800">{num(totalTokens)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Cost</span>
                        <p className="font-bold text-slate-800">{money(totalCost)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Result */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-3">Generated Output</h3>
                  <ResultView result={job.result} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
