import React, { useMemo, useState } from 'react';
import { Calendar, Clock, Video, User, FileText, CheckCircle2, RefreshCcw } from 'lucide-react';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, EmptyState, Skeleton } from '../components/ui';
import { humanize, dateTime, relativeTime, personName, num } from '../lib/format';

const STATUS_STYLES = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  COMPLETED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  NO_SHOW: 'bg-slate-100 text-slate-600 border-slate-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200'
};

const startOf = (m) => m.startTime || m.startTimeIso || m.startAt || m.scheduledStartAt || m.createdAt;

export default function Bookings() {
  const [selectedId, setSelectedId] = useState(null);

  const meetings = useAsync(() => api.calendar.meetings.list({ page: 1, limit: 50 }), []);
  const stats = useAsync(() => api.calendar.meetings.stats({ windowDays: 7 }).catch(() => null), []);
  const leadsById = useAsync(async () => {
    const res = await api.leads.list({ page: 1, limit: 100 });
    const map = {};
    for (const l of res?.data ?? []) map[l.id] = l;
    return map;
  }, []);

  const leadMap = leadsById.data ?? {};

  // Newest / soonest meetings first.
  const shown = useMemo(() => {
    const list = Array.isArray(meetings.data) ? meetings.data : meetings.data?.data ?? [];
    return [...list].sort((a, b) => new Date(startOf(b)) - new Date(startOf(a)));
  }, [meetings.data]);

  const activeId = selectedId ?? shown[0]?.id ?? null;

  const detail = useAsync(
    () => (activeId ? api.calendar.meetings.get(activeId) : Promise.resolve(null)),
    [activeId]
  );
  const logs = useAsync(
    () => (activeId ? api.calendar.meetings.logs(activeId).catch(() => []) : Promise.resolve([])),
    [activeId]
  );

  const m = detail.data;
  const mLead = m ? leadMap[m.leadId] : null;
  const logRows = Array.isArray(logs.data) ? logs.data : [];

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Meetings &amp; Handoffs</h2>
          <p className="text-sm text-slate-500 mt-1">Booked meetings, routing, and conversation context.</p>
        </div>
        <button
          onClick={() => {
            meetings.reload();
            stats.reload();
          }}
          className="flex items-center space-x-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <RefreshCcw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left: meeting list */}
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Meetings</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">
              {stats.data ? `${num(stats.data.meetingsBooked)} in 7d` : `${shown.length} shown`}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {meetings.loading && (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            )}

            {meetings.error && (
              <div className="p-4">
                <ErrorState error={meetings.error} onRetry={meetings.reload} compact />
              </div>
            )}

            {!meetings.loading && !meetings.error && shown.length === 0 && (
              <EmptyState icon={Calendar} title="No meetings booked yet" />
            )}

            {shown.map((mt) => {
              const active = mt.id === activeId;
              const lead = leadMap[mt.leadId];
              return (
                <button
                  key={mt.id}
                  onClick={() => setSelectedId(mt.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    active ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold ${active ? 'text-slate-900' : 'text-slate-700'}`}>
                      {personName(lead) !== '—' ? personName(lead) : mt.attendeeName || mt.title || 'Meeting'}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        STATUS_STYLES[mt.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {humanize(mt.status)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2 truncate">{mt.title || lead?.company || '—'}</p>
                  <div className="flex items-center text-xs text-slate-400 space-x-3">
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      {dateTime(startOf(mt))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: detail */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {!activeId ? (
            <EmptyState icon={Calendar} title="Select a meeting" />
          ) : detail.loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : detail.error ? (
            <div className="p-6">
              <ErrorState error={detail.error} onRetry={detail.reload} />
            </div>
          ) : !m ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">
                      {m.title || `${personName(mLead)} — Meeting`}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span className="flex items-center font-medium">
                        <Calendar size={16} className="mr-1.5 text-indigo-600" />
                        {dateTime(startOf(m))}
                      </span>
                      {m.durationMinutes && (
                        <span className="flex items-center font-medium">
                          <Clock size={16} className="mr-1.5 text-indigo-600" />
                          {m.durationMinutes} min
                        </span>
                      )}
                    </div>
                  </div>
                  {(m.meetingUrl || m.joinUrl || m.location) && (
                    <a
                      href={m.meetingUrl || m.joinUrl || m.location}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <Video size={16} />
                      <span>Join</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-sm">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <span className="text-slate-500 mr-2">Attendee:</span>
                      <span className="font-medium inline-flex items-center">
                        <User size={14} className="mr-1 text-slate-400" />
                        {m.attendeeName || m.attendeeEmail || personName(mLead)}
                      </span>
                    </div>
                    {m.campaignId && (
                      <div className="flex items-center">
                        <span className="text-slate-500 mr-2">Campaign:</span>
                        <span className="font-mono text-xs text-slate-600">{m.campaignId}</span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex items-center text-sm font-medium px-3 py-1 rounded-full border ${
                      STATUS_STYLES[m.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 size={16} className="mr-1.5" />
                    {humanize(m.status)}
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {m.description && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
                      <FileText size={18} className="text-slate-600" />
                      <h3 className="font-bold text-slate-800">Notes</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{m.description}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-slate-800 mb-3">Activity Log</h3>
                  {logs.loading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : logRows.length === 0 ? (
                    <p className="text-sm text-slate-400">No log entries.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                      {logRows.map((entry, i) => (
                        <div key={entry.id || i} className="px-4 py-3 flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="text-sm text-slate-800">
                              {humanize(entry.type || entry.action || entry.event || 'Event')}
                            </p>
                            {(entry.message || entry.detail) && (
                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                {entry.message || entry.detail}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 shrink-0 ml-3">
                            {relativeTime(entry.createdAt || entry.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
