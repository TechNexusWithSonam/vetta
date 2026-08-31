import React, { useEffect, useMemo, useState } from 'react';
import { Phone, PhoneOff, Activity, User, Building, MessageSquare, RefreshCcw } from 'lucide-react';
import { api, ApiError } from '../api';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, Skeleton } from '../components/ui';
import { humanize, relativeTime, personName, num, pct } from '../lib/format';

const IN_FLIGHT = ['QUEUED', 'INITIATING', 'RINGING', 'CONNECTED', 'IN_PROGRESS'];

const STATUS_COLOR = {
  QUEUED: 'text-slate-500',
  INITIATING: 'text-slate-500',
  RINGING: 'text-orange-500',
  CONNECTED: 'text-emerald-600',
  IN_PROGRESS: 'text-emerald-600',
  COMPLETED: 'text-slate-500',
  FAILED: 'text-red-500',
  NO_ANSWER: 'text-slate-500',
  BUSY: 'text-orange-500',
  VOICEMAIL: 'text-slate-500',
  CANCELLED: 'text-red-500',
  DO_NOT_CALL: 'text-red-500'
};

function Transcript({ callId }) {
  const t = useAsync(() => api.voice.calls.transcript(callId), [callId]);
  const turns = Array.isArray(t.data) ? t.data : t.data?.turns ?? [];

  if (t.loading) return <Skeleton className="h-40 w-full" />;
  if (t.error) return <ErrorState error={t.error} onRetry={t.reload} compact />;
  if (turns.length === 0) return <p className="text-sm text-slate-400">No transcript turns yet.</p>;

  return (
    <div className="space-y-4">
      {turns.map((turn, i) => {
        const who = turn.speaker || turn.role || turn.from || 'agent';
        const isAgent = /agent|assistant|ai|rep|bot/i.test(who);
        const text = turn.text || turn.content || turn.message || '';
        return (
          <div key={i} className={`flex flex-col ${isAgent ? '' : 'items-end'}`}>
            <span className={`text-xs font-semibold mb-1 ${isAgent ? 'text-indigo-600' : 'text-emerald-600'}`}>
              {humanize(who)}
            </span>
            <p
              className={`text-sm p-3 rounded-lg border max-w-[85%] text-slate-800 ${
                isAgent
                  ? 'bg-indigo-50 border-indigo-100 rounded-tl-none self-start'
                  : 'bg-slate-100 border-slate-200 rounded-tr-none self-end'
              }`}
            >
              {text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function LiveCalls() {
  const voice = useAsync(() => api.analytics.dashboard.voice(), []);
  const calls = useAsync(() => api.voice.calls.list({ page: 1, limit: 15 }), []);
  const leadsById = useAsync(async () => {
    const res = await api.leads.list({ page: 1, limit: 100 });
    const map = {};
    for (const l of res?.data ?? []) map[l.id] = l;
    return map;
  }, []);

  const [endedIds, setEndedIds] = useState([]);
  const [ending, setEnding] = useState(false);

  const rows = (calls.data?.data ?? []).filter((c) => !endedIds.includes(c.id));
  const leadMap = leadsById.data ?? {};
  const v = voice.data ?? {};

  const activeLines = useMemo(() => rows.filter((c) => IN_FLIGHT.includes(c.status)), [rows]);
  const activeCall = useMemo(
    () => rows.find((c) => c.status === 'CONNECTED' || c.status === 'IN_PROGRESS') || null,
    [rows]
  );

  // Refresh call list periodically while the page is open.
  const reloadCalls = calls.reload;
  useEffect(() => {
    const id = setInterval(reloadCalls, 15000);
    return () => clearInterval(id);
  }, [reloadCalls]);

  const endCall = async (id) => {
    if (!window.confirm('End this live call? This sends a real hang-up to the provider.')) return;
    setEnding(true);
    try {
      await api.voice.calls.cancel(id);
      setEndedIds((prev) => [...prev, id]);
      calls.reload();
    } catch (err) {
      alert(err instanceof ApiError ? `Could not end call: ${err.message}` : 'Could not end call.');
    } finally {
      setEnding(false);
    }
  };

  const callLabel = (c) => {
    const lead = leadMap[c.leadId];
    return personName(lead) !== '—' ? personName(lead) : c.toNumber || c.phoneNumber || 'Unknown';
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Top Status Bar */}
      <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  activeLines.length ? 'animate-ping bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  activeLines.length ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </span>
            <span
              className={`font-semibold text-sm tracking-wide uppercase ${
                activeLines.length ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {activeLines.length ? 'Lines Active' : 'Idle'}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-slate-300 text-sm">
            {calls.loading ? 'Loading calls…' : `${rows.length} recent call${rows.length === 1 ? '' : 's'}`}
          </span>
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs">Calls Placed</span>
            <span className="text-white font-bold">{voice.loading ? '—' : num(v.callsPlaced)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs">Answer Rate</span>
            <span className="text-white font-bold">{voice.loading ? '—' : pct(v.answerRate)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs">Failed</span>
            <span className="text-white font-bold">{voice.loading ? '—' : num(v.failedCalls)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left: Recent / active lines */}
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Call Lines</h2>
            <button onClick={calls.reload} className="text-slate-400 hover:text-slate-600">
              <RefreshCcw size={15} />
            </button>
          </div>

          <div className="p-2 overflow-y-auto flex-1 space-y-2">
            {calls.loading &&
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}

            {calls.error && (
              <div className="p-2">
                <ErrorState error={calls.error} onRetry={calls.reload} compact />
              </div>
            )}

            {!calls.loading && !calls.error && rows.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No recent calls.</p>
            )}

            {rows.map((c) => (
              <div key={c.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700 truncate">{callLabel(c)}</span>
                  <span className={`text-xs font-semibold ${STATUS_COLOR[c.status] || 'text-slate-500'}`}>
                    {humanize(c.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {leadMap[c.leadId]?.company || c.toNumber || c.phoneNumber || '—'} · {relativeTime(c.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active bridged call */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {activeCall ? (
            <>
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white flex justify-between items-start">
                <div className="flex space-x-4 items-start">
                  <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-slate-900">{callLabel(activeCall)}</h2>
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded animate-pulse flex items-center">
                        <Activity size={12} className="mr-1" /> {humanize(activeCall.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                      <span className="flex items-center">
                        <Building size={14} className="mr-1" />
                        {leadMap[activeCall.leadId]?.company || activeCall.toNumber || '—'}
                      </span>
                      <span>Started {relativeTime(activeCall.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => endCall(activeCall.id)}
                  disabled={ending}
                  className="p-3 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  title="End call"
                >
                  <PhoneOff size={20} />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                <div className="w-1/2 p-6 border-r border-slate-200 overflow-y-auto bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                    <MessageSquare size={16} className="mr-2 text-indigo-600" />
                    Call Details
                  </h3>
                  <div className="space-y-3">
                    {[
                      ['Status', humanize(activeCall.status)],
                      ['Lead', personName(leadMap[activeCall.leadId])],
                      ['Company', leadMap[activeCall.leadId]?.company || '—'],
                      ['Campaign', activeCall.campaignId || '—'],
                      ['Number', activeCall.toNumber || activeCall.phoneNumber || '—']
                    ].map(([label, value]) => (
                      <div key={label} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-0.5">{label}</p>
                        <p className="text-sm text-slate-800 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-1/2 p-6 overflow-y-auto bg-white flex flex-col">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Live Transcript</h3>
                  <Transcript callId={activeCall.id} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50">
              <Phone size={48} className="text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">No live connection right now</p>
              <p className="text-sm mt-2">
                {activeLines.length
                  ? `${activeLines.length} line${activeLines.length === 1 ? '' : 's'} dialing…`
                  : 'Start a voice call to bridge a live conversation here.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
