import React, { useState } from 'react';
import {
  GitBranch,
  MessageSquare,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { api, ApiError } from '../api';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, EmptyState, Skeleton } from '../components/ui';
import { humanize, relativeTime, num } from '../lib/format';

const STATUS_STYLES = {
  DRAFT: 'bg-slate-100 text-slate-600',
  READY: 'bg-blue-100 text-blue-700',
  SCHEDULED: 'bg-indigo-100 text-indigo-700',
  RUNNING: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-slate-100 text-slate-500',
  COMPLETED: 'bg-indigo-100 text-indigo-700'
};

const detectTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

// The backend lifecycle is READY -> SCHEDULED -> RUNNING: `start` only accepts a
// SCHEDULED campaign. This page has no schedule editor, so starting a READY
// campaign first applies a sensible default schedule (Mon–Fri, 09:00–17:00,
// local tz) to move it to SCHEDULED, then starts it.
const DEFAULT_SCHEDULE = {
  timezone: detectTz(),
  businessHoursStart: '09:00',
  businessHoursEnd: '17:00',
  workDays: [1, 2, 3, 4, 5],
};

async function scheduleAndStart(id) {
  await api.campaigns.configureSchedule(id, DEFAULT_SCHEDULE);
  return api.campaigns.start(id);
}

// Which lifecycle action to offer for a given status.
function nextAction(status) {
  switch (status) {
    case 'DRAFT':
      return { label: 'Mark Ready', icon: CheckCircle2, fn: (id) => api.campaigns.markReady(id) };
    case 'READY':
      return { label: 'Start', icon: Play, fn: scheduleAndStart };
    case 'SCHEDULED':
      return { label: 'Start', icon: Play, fn: (id) => api.campaigns.start(id) };
    case 'RUNNING':
      return { label: 'Pause', icon: Pause, fn: (id) => api.campaigns.pause(id) };
    case 'PAUSED':
      return { label: 'Resume', icon: Play, fn: (id) => api.campaigns.resume(id) };
    default:
      return null;
  }
}

export default function Workflow() {
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  const campaigns = useAsync(() => api.campaigns.list({ page: 1, limit: 50 }), []);
  const objections = useAsync(() => api.objections.list(), []);

  const rows = campaigns.data?.data ?? [];
  const activeId = selectedId ?? rows[0]?.id ?? null;

  const detail = useAsync(
    () => (activeId ? api.campaigns.get(activeId) : Promise.resolve(null)),
    [activeId]
  );

  const campaign = detail.data;
  const action = campaign ? nextAction(campaign.status) : null;
  const objectionRows = Array.isArray(objections.data) ? objections.data : [];

  const runAction = async () => {
    if (!action || !campaign) return;
    setBusy(true);
    try {
      await action.fn(campaign.id);
      detail.reload();
      campaigns.reload();
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? Array.isArray(err.body?.message)
            ? err.body.message.join(', ')
            : err.message
          : null;
      alert(detail ? `${action.label} failed: ${detail}` : `${action.label} failed.`);
    } finally {
      setBusy(false);
    }
  };

  const scriptKey = campaign?.config?.scriptPromptKey;

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {campaign?.name || (detail.loading ? 'Loading…' : 'Campaign Workflow')}
          </h2>
          <p className="text-sm text-slate-500">
            {campaign
              ? `${humanize(campaign.status)} · ${num(campaign.totalLeads)} leads`
              : 'Select a campaign to configure its script and objection handling'}
          </p>
        </div>
        {action && (
          <button
            onClick={runAction}
            disabled={busy}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <action.icon size={16} />}
            <span>{action.label}</span>
          </button>
        )}
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left: campaigns */}
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Campaigns</h3>
            <span className="text-slate-400">
              <Plus size={18} />
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {campaigns.loading && (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            )}

            {campaigns.error && (
              <div className="p-4">
                <ErrorState error={campaigns.error} onRetry={campaigns.reload} compact />
              </div>
            )}

            {!campaigns.loading && !campaigns.error && rows.length === 0 && (
              <EmptyState icon={GitBranch} title="No campaigns yet" />
            )}

            {rows.map((c) => {
              const active = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    active
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium truncate ${active ? 'text-slate-900' : 'text-slate-700'}`}>
                      {c.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        STATUS_STYLES[c.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {humanize(c.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{relativeTime(c.createdAt)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: script + objections */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center space-x-2 bg-slate-50">
            <MessageSquare size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-800">Script &amp; Objection Handling</h3>
          </div>

          <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
            {!activeId ? (
              <EmptyState icon={GitBranch} title="Select a campaign" />
            ) : detail.loading ? (
              <div className="max-w-2xl mx-auto space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : detail.error ? (
              <ErrorState error={detail.error} onRetry={detail.reload} />
            ) : !campaign ? (
              <div className="max-w-2xl mx-auto space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Script */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Call Script</span>
                    {scriptKey && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium font-mono">
                        {scriptKey}
                      </span>
                    )}
                  </div>
                  <div className="p-4 text-sm text-slate-600">
                    {campaign.description || 'No description set for this campaign.'}
                    {!scriptKey && (
                      <p className="text-xs text-slate-400 mt-2">
                        No script prompt key configured on <code>config.scriptPromptKey</code>.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center text-slate-400">
                  <GitBranch size={24} />
                </div>

                {/* Objections */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-700">Objection Handlers</h4>
                    {objections.loading && <Loader2 size={14} className="animate-spin text-slate-400" />}
                  </div>

                  {objections.error ? (
                    <ErrorState error={objections.error} onRetry={objections.reload} compact />
                  ) : objectionRows.length === 0 && !objections.loading ? (
                    <p className="text-sm text-slate-400">No objection handlers configured.</p>
                  ) : (
                    <div className="space-y-3">
                      {objectionRows.map((o) => (
                        <div
                          key={o.id || o.type}
                          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-slate-200 text-slate-800 text-xs font-bold px-2 py-1 rounded">
                              {humanize(o.type)}
                            </span>
                            {o.isCustom ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                <ShieldCheck size={10} className="mr-1" /> Custom
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          {o.intent && <p className="text-xs text-slate-500 mb-1">{o.intent}</p>}
                          {o.recommendedResponse && (
                            <p className="text-sm text-slate-800">{o.recommendedResponse}</p>
                          )}
                          {o.followUpQuestion && (
                            <p className="text-xs text-slate-500 mt-2">
                              <span className="font-semibold">Follow-up:</span> {o.followUpQuestion}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
