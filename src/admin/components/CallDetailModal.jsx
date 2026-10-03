import { api } from '../../api';
import { ErrorState, LoadingState, Modal } from '../../components/ui';
import { dateTime, duration } from '../../lib/format';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { friendlyError } from '../lib/adminErrors.js';
import { currency, label } from '../lib/format.js';
import { DetailList } from './DetailList.jsx';
import { StatusBadge } from './StatusBadge.jsx';

/** Cross-tenant call detail: metadata, AI outcome summary, transcript and event timeline (GET /admin/calls/:id). */
export function CallDetailModal({ callId, onClose }) {
  const q = useAdminQuery((signal) => api.admin.calls.get(callId, { signal }), [callId]);
  const c = q.data;

  return (
    <Modal open onClose={onClose} title="Call details" size="xl">
      {q.loading ? (
        <LoadingState label="Loading call…" />
      ) : q.error ? (
        <ErrorState error={friendlyError(q.error)} onRetry={q.reload} />
      ) : (
        <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
          <DetailList
            columns={3}
            items={[
              { label: 'Organization', value: c.organizationName },
              { label: 'Lead', value: [c.leadName, c.leadCompany].filter(Boolean).join(' · ') },
              { label: 'Requested by', value: c.requestedByEmail || (c.campaignId ? 'Campaign' : null) },
              { label: 'Status', value: <StatusBadge status={c.status} domain="call" /> },
              { label: 'Outcome', value: label(c.outcome) },
              { label: 'Provider', value: c.provider },
              { label: 'To', value: c.toPhoneNumber },
              { label: 'From', value: c.fromPhoneNumber },
              { label: 'Duration', value: duration(c.durationSeconds) },
              { label: 'Cost', value: c.costUsd === null ? null : currency(c.costUsd) },
              { label: 'Meeting booked', value: c.meetingBooked ? 'Yes' : 'No' },
              { label: 'Failure reason', value: label(c.failureReason) },
              { label: 'Created', value: dateTime(c.createdAt) },
              { label: 'Started', value: dateTime(c.startedAt) },
              { label: 'Ended', value: dateTime(c.endedAt) },
            ]}
          />
          {c.errorMessage && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{c.errorMessage}</p>
          )}

          {c.outcomeSummary && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-slate-800">AI call summary</h4>
              <p className="text-sm text-slate-700">{c.outcomeSummary.summary}</p>
              <p className="mt-2 text-xs text-slate-500">Next action: {c.outcomeSummary.nextAction}</p>
            </section>
          )}

          <section>
            <h4 className="mb-2 text-sm font-semibold text-slate-800">Transcript</h4>
            {c.transcript.length === 0 ? (
              <p className="text-sm text-slate-400">No transcript recorded for this call.</p>
            ) : (
              <div className="space-y-2">
                {c.transcript.map((t) => (
                  <div key={t.id} className="text-sm">
                    <span className={`mr-2 font-semibold ${t.speaker === 'agent' ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {t.speaker === 'agent' ? 'AI' : 'Lead'}:
                    </span>
                    <span className="text-slate-700">{t.text}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold text-slate-800">Timeline</h4>
            {c.events.length === 0 ? (
              <p className="text-sm text-slate-400">No events recorded.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {c.events.map((e) => (
                  <li key={e.id} className="flex justify-between gap-3 py-1.5">
                    <span className="text-slate-700">
                      {label(e.type)}
                      {e.toState && <span className="text-slate-400"> → {label(e.toState)}</span>}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">{dateTime(e.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}

export default CallDetailModal;
