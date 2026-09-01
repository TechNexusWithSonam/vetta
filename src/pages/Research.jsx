import React, { useEffect, useMemo, useState } from 'react';
import {
  BrainCircuit,
  Search,
  Building,
  User,
  RefreshCcw,
  Loader2,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { api, ApiError } from '../api';
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
const NON_TERMINAL = ['PENDING', 'RUNNING', 'PROCESSING', 'QUEUED'];
const asPct = (v) => (v == null ? null : Math.round(Number(v) <= 1 ? Number(v) * 100 : Number(v)));

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  );
}

function ResultView({ result, status }) {
  if (result == null) {
    return (
      <p className="text-sm text-slate-500">
        {NON_TERMINAL.includes(status)
          ? 'Waiting for the AI worker to finish…'
          : 'No result payload was written for this job.'}
      </p>
    );
  }
  if (typeof result === 'string') {
    return <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result}</p>;
  }

  const summary = result.companySummary || result.summary;
  const painPoints = result.painPoints || result.pains;
  const angle = result.callAngle || result.angle || result.recommendedAngle;
  const score = asPct(result.confidenceScore ?? result.confidence);
  const anyKnown =
    summary || (Array.isArray(painPoints) && painPoints.length) || angle || score != null;

  if (!anyKnown) {
    return (
      <pre className="text-xs bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  }

  return (
    <div className="space-y-4">
      {score != null && (
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-bold text-indigo-600">
            {score}
            <span className="text-sm text-slate-400">/100</span>
          </div>
          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</span>
        </div>
      )}
      {summary && <Section title="Company Summary">{summary}</Section>}
      {Array.isArray(painPoints) && painPoints.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pain Points</h4>
          <ul className="space-y-1.5">
            {painPoints.map((p, i) => (
              <li key={i} className="text-sm text-slate-700">
                • {typeof p === 'string' ? p : p?.label || p?.text || JSON.stringify(p)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {angle && (
        <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-4">
          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Recommended Call Angle</h4>
          <p className="text-sm text-indigo-900">{angle}</p>
        </div>
      )}
      <details className="text-xs text-slate-500">
        <summary className="cursor-pointer select-none">Raw payload</summary>
        <pre className="mt-2 bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function Research() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [startLeadId, setStartLeadId] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const [retrying, setRetrying] = useState(false);

  const jobs = useAsync(() => api.research.list({ page: 1, limit: 50 }), []);
  const leads = useAsync(() => api.leads.list({ page: 1, limit: 100 }), []);
  const cost = useAsync(() => api.research.costAnalytics().catch(() => null), []);

  const jobRows = useMemo(() => jobs.data?.data ?? [], [jobs.data]);
  const leadList = useMemo(() => leads.data?.data ?? [], [leads.data]);
  const leadMap = useMemo(() => {
    const m = {};
    for (const l of leadList) m[l.id] = l;
    return m;
  }, [leadList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobRows;
    return jobRows.filter((j) => {
      const lead = leadMap[j.leadId];
      const hay = `${personName(lead)} ${lead?.company ?? ''} ${j.type} ${j.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [jobRows, leadMap, search]);

  const activeId = selectedId ?? jobRows[0]?.id ?? null;

  const detail = useAsync(
    () => (activeId ? api.research.get(activeId) : Promise.resolve(null)),
    [activeId]
  );
  const providerLogs = useAsync(
    () => (activeId ? api.research.providerLogs(activeId).catch(() => []) : Promise.resolve([])),
    [activeId]
  );

  const job = detail.data;
  const jobLead = job ? leadMap[job.leadId] : null;
  const logs = Array.isArray(providerLogs.data) ? providerLogs.data : [];
  const totalCost = logs.reduce((sum, l) => sum + Number(l.costUsd || l.cost || 0), 0);
  const totalTokens = logs.reduce(
    (sum, l) => sum + Number(l.totalTokens || (l.inputTokens || 0) + (l.outputTokens || 0) || 0),
    0
  );

  const reloadDetail = detail.reload;
  const jobStatus = job?.status;

  // Auto-poll a non-terminal job every 5s until it finishes.
  useEffect(() => {
    if (!jobStatus || !NON_TERMINAL.includes(jobStatus)) return undefined;
    const id = setInterval(() => reloadDetail(), 5000);
    return () => clearInterval(id);
  }, [jobStatus, reloadDetail]);

  const refreshJobs = () => {
    setRefreshing(true);
    Promise.allSettled([jobs.reload(), leads.reload(), cost.reload()]).finally(() => setRefreshing(false));
  };

  const startResearch = async () => {
    if (!startLeadId || starting) return;
    setStarting(true);
    setStartError('');
    try {
      const created = await api.research.start({ leadId: startLeadId, type: 'COMPANY_RESEARCH' });
      setStartLeadId('');
      await jobs.reload();
      if (created?.id) setSelectedId(created.id);
    } catch (err) {
      setStartError(
        err instanceof ApiError
          ? Array.isArray(err.body?.message)
            ? err.body.message.join(', ')
            : err.message
          : 'Could not start research.'
      );
    } finally {
      setStarting(false);
    }
  };

  const retryJob = async () => {
    if (!activeId || retrying) return;
    setRetrying(true);
    try {
      await api.research.retry(activeId);
      reloadDetail();
      jobs.reload();
    } catch (err) {
      alert(err instanceof ApiError ? `Retry failed: ${err.message}` : 'Retry failed.');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Intelligence</h2>
          <p className="text-sm text-slate-500 mt-1">
            AI research jobs, provider runs, and generated summaries.
            {cost.data && (
              <span className="ml-2 text-slate-400">
                · {money(cost.data.totalCostUsd ?? cost.data.totalCost ?? 0)} spent (30d)
              </span>
            )}
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
          {/* Start research */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
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
            <div className="flex gap-2">
              <select
                value={startLeadId}
                onChange={(e) => setStartLeadId(e.target.value)}
                disabled={leads.loading || starting}
                className="flex-1 min-w-0 border border-slate-200 rounded-md py-1.5 px-2 text-xs text-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">
                  {leads.loading ? 'Loading leads…' : leadList.length ? 'Pick a lead…' : 'No leads yet'}
                </option>
                {leadList.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.company ? `${l.company} — ` : ''}
                    {personName(l)}
                  </option>
                ))}
              </select>
              <button
                onClick={startResearch}
                disabled={!startLeadId || starting}
                title="Start company research"
                className="shrink-0 flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {starting ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                <span>Start</span>
              </button>
            </div>
            {startError && <p className="text-[11px] text-rose-600">{startError}</p>}
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
              <EmptyState icon={BrainCircuit} title="No research jobs" hint="Pick a lead above and hit Start." />
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
                    {NON_TERMINAL.includes(job.status) ? (
                      <Loader2 size={12} className="inline mr-1 animate-spin" />
                    ) : null}
                    {humanize(job.status)}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">
                    {job.completedAt ? `Completed ${relativeTime(job.completedAt)}` : `Started ${relativeTime(job.createdAt)}`}
                  </p>
                  {job.status === 'FAILED' && (
                    <button
                      onClick={retryJob}
                      disabled={retrying}
                      className="mt-2 inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                    >
                      {retrying ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {NON_TERMINAL.includes(job.status) && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <Loader2 size={16} className="animate-spin shrink-0" />
                      <span>Job is {humanize(job.status).toLowerCase()} — auto-refreshing every 5s.</span>
                    </div>
                    {job.attempts === 0 && !job.provider && (
                      <p className="text-xs pl-6 leading-relaxed">
                        Not picked up by a worker yet. If it stays pending, the backend AI research
                        worker isn&apos;t running on this deployment — jobs won&apos;t complete until it is.
                      </p>
                    )}
                    <div className="pl-6">
                      <button
                        onClick={retryJob}
                        disabled={retrying}
                        className="text-xs font-semibold text-indigo-700 hover:underline disabled:opacity-50"
                      >
                        {retrying ? 'Re-enqueuing…' : 'Re-enqueue job'}
                      </button>
                    </div>
                  </div>
                )}

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

                {/* Provider usage */}
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
                  <ResultView result={job.result} status={job.status} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
