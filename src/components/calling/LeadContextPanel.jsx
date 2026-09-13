/**
 * Lead context shown alongside a selected call. Uses the lead object already
 * loaded in bulk by `LiveCalls` (no extra fetch) plus one `leads.timeline`
 * call per selected lead (merged notes + audit log, per `leads.js`) — not a
 * separate `leads.notes` call, to avoid a second round trip for overlapping
 * data.
 */
import React from 'react';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { SkeletonText, ErrorState } from '../ui';
import { humanize, relativeTime } from '../../lib/format';

export default function LeadContextPanel({ lead }) {
  const timeline = useAsync(
    () => (lead?.id ? api.leads.timeline(lead.id) : Promise.resolve([])),
    [lead?.id],
  );

  if (!lead) {
    return <p className="text-xs text-slate-400">No lead linked to this call.</p>;
  }

  const rows = Array.isArray(timeline.data) ? timeline.data : timeline.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-slate-400">Status</p>
          <p className="text-slate-800 font-medium">{humanize(lead.status)}</p>
        </div>
        <div>
          <p className="text-slate-400">Title</p>
          <p className="text-slate-800 font-medium">{lead.title || '—'}</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase text-slate-500">Recent activity</p>
        {timeline.loading && <SkeletonText lines={3} />}
        {timeline.error && <ErrorState error={timeline.error} onRetry={timeline.reload} compact />}
        {!timeline.loading && !timeline.error && rows.length === 0 && (
          <p className="text-xs text-slate-400">No notes or activity yet.</p>
        )}
        {!timeline.loading && !timeline.error && rows.length > 0 && (
          <ul className="max-h-32 space-y-1.5 overflow-y-auto">
            {rows.slice(0, 8).map((item, i) => (
              <li key={item.id ?? i} className="text-xs text-slate-600">
                <span className="font-medium">{humanize(item.type || item.action || 'Update')}</span>
                {item.content && <> — {item.content}</>}
                <span className="text-slate-400"> · {relativeTime(item.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
