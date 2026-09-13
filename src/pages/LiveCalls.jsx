import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Phone,
  PhoneOff,
  Activity,
  User,
  Building,
  MessageSquare,
  RefreshCcw,
  Clock,
  DollarSign,
  Sparkles,
  Search,
  CalendarClock,
  CalendarPlus,
  FileAudio,
  ShieldOff,
  PhoneCall
} from 'lucide-react';
import { api, ApiError } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useDncPhones } from '../hooks/useDncPhones';
import { useAuth } from '../context/useAuth';
import { canManageCalls } from '../lib/roles';
import { ErrorState, EmptyState, Skeleton, Badge, Button, Tooltip, useToast } from '../components/ui';
import { humanize, relativeTime, personName, num, pct, money, duration as fmtDuration } from '../lib/format';
import CallbackModal from '../components/calling/CallbackModal';
import OutcomeModal from '../components/calling/OutcomeModal';
import RecordingSection from '../components/calling/RecordingSection';
import DoNotCallModal from '../components/calling/DoNotCallModal';
import CallNowModal from '../components/calling/CallNowModal';
import LeadContextPanel from '../components/calling/LeadContextPanel';
import BookingModal from '../components/calling/BookingModal';

const IN_FLIGHT = ['QUEUED', 'INITIATING', 'RINGING', 'CONNECTED', 'IN_PROGRESS'];
const LIVE = ['CONNECTED', 'IN_PROGRESS'];
// Backend only allows -> CALLBACK_SCHEDULED from a "didn't reach the lead"
// outcome. COMPLETED (and other terminal states) are rejected with a 409
// ("Cannot transition voice call status from X to CALLBACK_SCHEDULED").
const NOT_REACHED = ['FAILED', 'NO_ANSWER', 'BUSY', 'VOICEMAIL'];

const STATUS_TONE = {
  QUEUED: 'neutral',
  INITIATING: 'neutral',
  RINGING: 'warning',
  CONNECTED: 'success',
  IN_PROGRESS: 'success',
  COMPLETED: 'neutral',
  FAILED: 'danger',
  NO_ANSWER: 'neutral',
  BUSY: 'warning',
  VOICEMAIL: 'info',
  CALLBACK_SCHEDULED: 'info',
  CANCELLED: 'danger',
  DO_NOT_CALL: 'danger'
};

/** Classify a transcript turn's speaker without ever *guessing* it's the agent. */
function speakerRole(turn) {
  const who = String(turn.speaker || turn.role || turn.from || '').trim();
  if (!who) return 'unknown';
  if (/agent|assistant|\bai\b|rep|bot/i.test(who)) return 'agent';
  if (/lead|customer|prospect|caller|contact|user/i.test(who)) return 'lead';
  return 'unknown';
}

function Transcript({ callId, poll }) {
  const t = useAsync(() => api.voice.calls.transcript(callId), [callId]);
  const reload = t.reload;
  useEffect(() => {
    if (!poll) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) reload(); // paused while the tab is backgrounded
    }, 5000);
    return () => clearInterval(id);
  }, [poll, reload]);

  const turns = Array.isArray(t.data) ? t.data : t.data?.turns ?? [];

  if (t.loading) return <Skeleton className="h-40 w-full" />;
  if (t.error) return <ErrorState error={t.error} onRetry={t.reload} compact />;
  if (turns.length === 0) return <p className="text-sm text-slate-400">No transcript turns yet.</p>;

  return (
    <div className="space-y-4">
      {turns.map((turn, i) => {
        const role = speakerRole(turn);
        const rawWho = turn.speaker || turn.role || turn.from;
        const who = rawWho || (role === 'unknown' ? 'Unknown speaker' : role);
        const text = turn.text || turn.content || turn.message || '';
        const align = role === 'lead' ? 'items-end' : role === 'unknown' ? 'items-center' : 'items-start';
        const labelColor =
          role === 'agent' ? 'text-indigo-600' : role === 'lead' ? 'text-emerald-600' : 'text-slate-400';
        const bubble =
          role === 'agent'
            ? 'bg-indigo-50 border-indigo-100 rounded-tl-none self-start'
            : role === 'lead'
              ? 'bg-slate-100 border-slate-200 rounded-tr-none self-end'
              : 'bg-white border-dashed border-slate-300 self-center';
        return (
          <div key={i} className={`flex flex-col ${align}`}>
            <span className={`text-xs font-semibold mb-1 ${labelColor}`}>{humanize(who)}</span>
            <p className={`text-sm p-3 rounded-lg border max-w-[85%] text-slate-800 ${bubble}`}>{text}</p>
          </div>
        );
      })}
    </div>
  );
}

/** Presentational only — `CallDetail` owns the (polled) events fetch so the
 * AI Summary card and this timeline read the exact same data instead of each
 * hitting `voice.calls.events` independently. */
function EventTimeline({ events, loading, error, onRetry }) {
  if (loading) return <Skeleton className="h-24 w-full" />;
  if (error) return <ErrorState error={error} onRetry={onRetry} compact />;
  if (events.length === 0) return <p className="text-sm text-slate-400">No events yet.</p>;

  return (
    <ul className="space-y-2">
      {events.map((ev) => {
        const p = ev.payload || {};
        const detail = p.endedReason || p.rawStatus || (ev.toState ? humanize(ev.toState) : '') || '';
        const isFailureLike = /fail|error|no_answer|busy|cancel/i.test(String(ev.type || detail || ''));
        return (
          <li key={ev.id} className="flex items-start gap-2 text-xs">
            <span
              className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${isFailureLike ? 'bg-rose-400' : 'bg-slate-300'}`}
            />
            <div>
              <span className="font-semibold text-slate-700">{humanize(ev.type)}</span>
              {detail && <span className="text-slate-500"> · {humanize(String(detail))}</span>}
              <span className="text-slate-400"> · {relativeTime(ev.createdAt)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Details for one selected call — works for live *and* finished calls. */
function CallDetail({ call, lead, onEnd, ending, onSync, syncing, canManage, onDataChanged }) {
  const live = LIVE.includes(call.status);
  const inFlight = IN_FLIGHT.includes(call.status);
  const isTerminal = !inFlight;

  // Single source of truth for this call's events: both the timeline and the
  // AI-summary extraction below read from this one polled fetch.
  const events = useAsync(() => api.voice.calls.events(call.id, { limit: 50 }), [call.id]);
  const reloadEvents = events.reload;
  useEffect(() => {
    if (!inFlight) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) reloadEvents();
    }, 5000);
    return () => clearInterval(id);
  }, [inFlight, reloadEvents]);

  const eventRows = useMemo(
    () => (Array.isArray(events.data) ? events.data : events.data?.data ?? []),
    [events.data],
  );
  const summary = useMemo(() => {
    const withSummary = eventRows.find((ev) => ev.payload && ev.payload.summary);
    return withSummary?.payload || null;
  }, [eventRows]);

  const [showCallback, setShowCallback] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const name = personName(lead) !== '—' ? personName(lead) : call.toPhoneNumber || 'Unknown';
  const canScheduleCallback = NOT_REACHED.includes(call.status);

  return (
    <>
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white flex flex-wrap justify-between items-start gap-3">
        <div className="flex space-x-4 items-start">
          <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
            <User size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="text-xl font-bold text-slate-900">{name}</h2>
              <Badge tone={STATUS_TONE[call.status] || 'neutral'} dot className={live ? 'animate-pulse' : ''}>
                {live && <Activity size={12} />}
                {humanize(call.status)}
              </Badge>
            </div>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
              <span className="flex items-center">
                <Building size={14} className="mr-1" />
                {lead?.company || call.toPhoneNumber || '—'}
              </span>
              <span>
                {call.endedAt
                  ? `Ended ${relativeTime(call.endedAt)}`
                  : `Started ${relativeTime(call.startedAt || call.createdAt)}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {lead && canManage && (
            <Tooltip label="Book a meeting for this lead">
              <Button size="sm" iconLeft={CalendarPlus} onClick={() => setShowBooking(true)}>
                Book meeting
              </Button>
            </Tooltip>
          )}
          {lead && !canManage && (
            <Tooltip label="Only owners/admins can book meetings">
              <Button size="sm" iconLeft={CalendarPlus} disabled>
                Book meeting
              </Button>
            </Tooltip>
          )}
          {canScheduleCallback && (
            <Tooltip label="Schedule a callback">
              <Button size="sm" variant="secondary" iconLeft={CalendarClock} onClick={() => setShowCallback(true)}>
                Callback
              </Button>
            </Tooltip>
          )}
          {isTerminal && (
            <Tooltip label="View call outcome">
              <Button size="sm" variant="secondary" iconLeft={FileAudio} onClick={() => setShowOutcome(true)}>
                Outcome
              </Button>
            </Tooltip>
          )}
          <Tooltip label="Sync status from provider">
            <Button
              size="sm"
              variant="ghost"
              iconOnly
              iconLeft={RefreshCcw}
              onClick={onSync}
              disabled={syncing}
              className={syncing ? 'animate-spin' : ''}
              aria-label="Sync status from provider"
            />
          </Tooltip>
          {inFlight && canManage && (
            <Tooltip label="End this call">
              <Button
                size="md"
                variant="danger"
                iconOnly
                iconLeft={PhoneOff}
                onClick={() => onEnd(call.id)}
                disabled={ending}
                aria-label="End call"
              />
            </Tooltip>
          )}
          {inFlight && !canManage && (
            <span className="text-xs text-slate-400" title="Only owners/admins can end calls">
              Owners/admins can end calls
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 p-6 md:border-r border-b md:border-b-0 border-slate-200 overflow-y-auto bg-slate-50 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <MessageSquare size={16} className="mr-2 text-indigo-600" />
            Call Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Status', humanize(call.status)],
              ['Duration', fmtDuration(call.durationSeconds), <Clock key="c" size={12} />],
              ['Cost', call.costUsd != null ? money(call.costUsd) : '—', <DollarSign key="d" size={12} />],
              ['Attempt', call.attempt ?? '—'],
              ['Lead', personName(lead)],
              ['Company', lead?.company || '—'],
              ['Number', call.toPhoneNumber || call.phoneNumber || '—'],
              ['Provider', humanize(call.provider || '—')],
              ['Campaign', call.campaignId ? 'Campaign call' : 'Ad-hoc'],
              ['Ended reason', call.errorMessage ? humanize(call.errorMessage) : '—'],
              ['Meeting booked', call.meetingBooked ? 'Yes' : 'No'],
              ['Converted', call.converted ? 'Yes' : 'No']
            ].map(([label, value, icon]) => (
              <div key={label} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-[11px] text-slate-500 font-semibold uppercase mb-0.5 flex items-center gap-1">
                  {icon}
                  {label}
                </p>
                <p className="text-sm text-slate-800 truncate">{value}</p>
              </div>
            ))}
          </div>

          {summary && (
            <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
              <p className="text-[11px] text-indigo-600 font-semibold uppercase mb-1 flex items-center gap-1">
                <Sparkles size={12} /> AI Summary
                {summary.sentiment && (
                  <span className="ml-1 font-normal text-slate-400">· {humanize(summary.sentiment)}</span>
                )}
              </p>
              <p className="text-sm text-slate-700">{summary.summary}</p>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-[11px] text-slate-500 font-semibold uppercase mb-2">Lead context</p>
            <LeadContextPanel lead={lead} />
          </div>

          {isTerminal && (
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-[11px] text-slate-500 font-semibold uppercase mb-2 flex items-center gap-1">
                <FileAudio size={12} /> Recording
              </p>
              <RecordingSection callId={call.id} />
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-[11px] text-slate-500 font-semibold uppercase mb-2">Timeline</p>
            <EventTimeline
              events={eventRows}
              loading={events.loading}
              error={events.error}
              onRetry={events.reload}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
            {live ? 'Live Transcript' : 'Transcript'}
          </h3>
          <Transcript callId={call.id} poll={inFlight} />
        </div>
      </div>

      <CallbackModal
        open={showCallback}
        onClose={() => setShowCallback(false)}
        call={call}
        onScheduled={() => {
          setShowCallback(false);
          onDataChanged?.();
        }}
      />
      <OutcomeModal open={showOutcome} onClose={() => setShowOutcome(false)} call={call} />
      <BookingModal
        open={showBooking}
        onClose={() => setShowBooking(false)}
        lead={lead || {}}
        callSummary={summary?.summary}
        onBooked={() => setShowBooking(false)}
      />
    </>
  );
}

function CallRow({ call, lead, selected, onSelect }) {
  const label = personName(lead) !== '—' ? personName(lead) : call.toPhoneNumber || call.phoneNumber || 'Unknown';
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 border rounded-lg transition-colors ${
        selected
          ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200'
          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
      }`}
    >
      <div className="flex justify-between items-center mb-1 gap-2">
        <span className="text-sm font-medium text-slate-700 truncate">{label}</span>
        <Badge tone={STATUS_TONE[call.status] || 'neutral'} size="sm">
          {humanize(call.status)}
        </Badge>
      </div>
      <p className="text-xs text-slate-500 truncate">
        {lead?.company || call.toPhoneNumber || call.phoneNumber || '—'} · {relativeTime(call.createdAt)}
        {call.durationSeconds != null && ` · ${fmtDuration(call.durationSeconds)}`}
      </p>
    </button>
  );
}

export default function LiveCalls() {
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  const canManage = canManageCalls(user);
  const { phones: dncPhones } = useDncPhones();

  const voiceStats = useAsync(() => api.analytics.dashboard.voice(), []);
  const calls = useAsync(() => api.voice.calls.list({ page: 1, limit: 15 }), []);
  const leadsById = useAsync(async () => {
    const res = await api.leads.list({ page: 1, limit: 100 });
    const map = {};
    for (const l of res?.data ?? []) map[l.id] = l;
    return map;
  }, []);

  const [ending, setEnding] = useState(false);
  // Auto-select a call handed off from Leads (`navigate('/app/live-calls', { state: { callId } })`)
  // so a just-placed QUEUED/INITIATING call is shown immediately instead of
  // making the user find it in the list.
  const [selectedId, setSelectedId] = useState(() => location.state?.callId ?? null);
  const [syncing, setSyncing] = useState(false);
  const [listFilter, setListFilter] = useState('');
  const [showCallNow, setShowCallNow] = useState(false);
  const [showDnc, setShowDnc] = useState(false);
  const autoSyncing = useRef(false);

  const rows = useMemo(() => calls.data?.data ?? [], [calls.data]);
  const leadMap = useMemo(() => leadsById.data ?? {}, [leadsById.data]);
  const v = voiceStats.data ?? {};

  const filteredRows = useMemo(() => {
    const q = listFilter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) => {
      const lead = leadMap[c.leadId];
      const label = personName(lead) !== '—' ? personName(lead) : c.toPhoneNumber || c.phoneNumber || '';
      const hay = [label, lead?.company, c.toPhoneNumber, c.phoneNumber, humanize(c.status)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, listFilter, leadMap]);

  const activeRows = useMemo(() => filteredRows.filter((c) => IN_FLIGHT.includes(c.status)), [filteredRows]);
  const recentRows = useMemo(() => filteredRows.filter((c) => !IN_FLIGHT.includes(c.status)), [filteredRows]);

  const activeLines = useMemo(() => rows.filter((c) => IN_FLIGHT.includes(c.status)), [rows]);
  // A stable primitive derived from `activeLines` — depending on this instead
  // of the array itself keeps the poll effect below from tearing down and
  // rebuilding its interval on every tick (a fresh `calls.data` object
  // otherwise produces a new `activeLines` array each time even when the set
  // of in-flight calls hasn't actually changed).
  const activeIdsKey = useMemo(() => activeLines.map((c) => c.id).join(','), [activeLines]);
  const liveCall = useMemo(() => rows.find((c) => LIVE.includes(c.status)) || null, [rows]);

  const selectedCall = (selectedId && rows.find((c) => c.id === selectedId)) || liveCall || null;

  const reloadCalls = calls.reload;

  // While any line is in flight, poll fast and nudge the backend to sync each
  // in-flight call from the provider (covers the no-inbound-webhook case).
  // Paused while the tab is hidden so a backgrounded tab doesn't keep
  // triggering real provider `sync` calls; reconciles immediately on return.
  useEffect(() => {
    const hasInFlight = activeLines.length > 0;
    const intervalMs = hasInFlight ? 5000 : 20000;

    const tick = async () => {
      if (document.hidden) return;
      if (hasInFlight && !autoSyncing.current) {
        autoSyncing.current = true;
        try {
          await Promise.allSettled(activeLines.slice(0, 4).map((c) => api.voice.calls.sync(c.id)));
        } catch {
          /* best-effort */
        } finally {
          autoSyncing.current = false;
        }
      }
      reloadCalls();
    };

    const id = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdsKey, reloadCalls]);

  const endCall = async (id) => {
    if (!canManage) return;
    if (!window.confirm('End this live call? This sends a real hang-up to the provider.')) return;
    setEnding(true);
    try {
      await api.voice.calls.cancel(id);
      // No client-side hiding: the reloaded row will carry the real
      // CANCELLED status and stay visible in Recent, not disappear.
      await calls.reload();
      toast.success('Call ended.');
    } catch (err) {
      toast.error(err instanceof ApiError ? `Could not end call: ${err.message}` : 'Could not end call.');
    } finally {
      setEnding(false);
    }
  };

  const syncSelected = useCallback(async () => {
    if (!selectedCall) return;
    setSyncing(true);
    try {
      await api.voice.calls.sync(selectedCall.id);
      await calls.reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? `Sync failed: ${err.message}` : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  }, [selectedCall, calls, toast]);

  const handleCreated = (created) => {
    setShowCallNow(false);
    setSelectedId(created.id);
    calls.reload();
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Top Status Bar */}
      <div className="bg-slate-900 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center flex-wrap gap-4">
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
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <span className="text-slate-300 text-sm">
            {calls.loading ? 'Loading calls…' : `${rows.length} recent call${rows.length === 1 ? '' : 's'}`}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs">Calls Placed</span>
            <span className="text-white font-bold">{voiceStats.loading ? '—' : num(v.callsPlaced)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs">Answer Rate</span>
            <span className="text-white font-bold">{voiceStats.loading ? '—' : pct(v.answerRate)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs">Failed</span>
            <span className="text-white font-bold">{voiceStats.loading ? '—' : num(v.failedCalls)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" iconLeft={ShieldOff} onClick={() => setShowDnc(true)}>
              DNC list
            </Button>
            {canManage ? (
              <Button size="sm" iconLeft={PhoneCall} onClick={() => setShowCallNow(true)}>
                Call now
              </Button>
            ) : (
              <Tooltip label="Only owners/admins can place calls">
                <Button size="sm" iconLeft={PhoneCall} disabled>
                  Call now
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-6 min-h-0">
        {/* Left: Recent / active lines */}
        <div className="w-full md:w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0 max-h-[420px] md:max-h-none">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Call Lines</h2>
            <Tooltip label="Refresh call list">
              <button
                onClick={calls.reload}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Refresh call list"
              >
                <RefreshCcw size={15} />
              </button>
            </Tooltip>
          </div>

          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={listFilter}
                onChange={(e) => setListFilter(e.target.value)}
                placeholder="Search lead, company, phone, status…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-2 overflow-y-auto flex-1 space-y-4">
            {calls.loading &&
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}

            {calls.error && (
              <div className="p-2">
                <ErrorState error={calls.error} onRetry={calls.reload} compact />
              </div>
            )}

            {!calls.loading && !calls.error && filteredRows.length === 0 && (
              <EmptyState
                icon={Phone}
                title={listFilter ? 'No calls match your search' : 'No recent calls'}
                hint={listFilter ? undefined : 'Place a call from Leads, or use "Call now" above.'}
              />
            )}

            {!calls.loading && !calls.error && activeRows.length > 0 && (
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active</p>
                {activeRows.map((c) => (
                  <CallRow
                    key={c.id}
                    call={c}
                    lead={leadMap[c.leadId]}
                    selected={selectedCall?.id === c.id}
                    onSelect={() => setSelectedId(c.id)}
                  />
                ))}
              </div>
            )}

            {!calls.loading && !calls.error && recentRows.length > 0 && (
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent</p>
                {recentRows.map((c) => (
                  <CallRow
                    key={c.id}
                    call={c}
                    lead={leadMap[c.leadId]}
                    selected={selectedCall?.id === c.id}
                    onSelect={() => setSelectedId(c.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: selected / live call detail */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[420px]">
          {selectedCall ? (
            <CallDetail
              key={selectedCall.id}
              call={selectedCall}
              lead={leadMap[selectedCall.leadId]}
              onEnd={endCall}
              ending={ending}
              onSync={syncSelected}
              syncing={syncing}
              canManage={canManage}
              onDataChanged={calls.reload}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50 p-6 text-center">
              <Phone size={48} className="text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">No live connection right now</p>
              <p className="text-sm mt-2">
                {activeLines.length
                  ? `${activeLines.length} line${activeLines.length === 1 ? '' : 's'} dialing… select one to watch`
                  : 'Start a voice call, or pick a past call to review its transcript.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <CallNowModal
        open={showCallNow}
        onClose={() => setShowCallNow(false)}
        onCreated={handleCreated}
        canManage={canManage}
        dncPhones={dncPhones}
      />
      <DoNotCallModal open={showDnc} onClose={() => setShowDnc(false)} canManage={canManage} />
    </div>
  );
}
