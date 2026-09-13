/**
 * Read-only outcome view backed by `voice.calls.outcome` (a GET — there is no
 * outcome-submission endpoint, so this never writes anything; it just shows
 * what the backend already computed).
 */
import React from 'react';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Modal, SkeletonText, ErrorState } from '../ui';
import { humanize, money, dateTime, duration } from '../../lib/format';

export default function OutcomeModal({ open, onClose, call }) {
  const outcome = useAsync(
    () => (open && call ? api.voice.calls.outcome(call.id) : Promise.resolve(null)),
    [open, call?.id],
  );

  const rows = outcome.data
    ? [
        ['Status', humanize(outcome.data.status)],
        ['Failure reason', outcome.data.failureReason ? humanize(outcome.data.failureReason) : '—'],
        ['Duration', duration(outcome.data.durationSeconds)],
        ['Cost', outcome.data.costUsd != null ? money(outcome.data.costUsd) : '—'],
        ['Meeting booked', outcome.data.meetingBooked ? 'Yes' : 'No'],
        ['Converted', outcome.data.converted ? 'Yes' : 'No'],
        ['Ended at', outcome.data.endedAt ? dateTime(outcome.data.endedAt) : '—'],
      ]
    : [];

  return (
    <Modal open={open} onClose={onClose} title="Call outcome" size="sm">
      {outcome.loading && <SkeletonText lines={5} />}
      {outcome.error && <ErrorState error={outcome.error} onRetry={outcome.reload} compact />}
      {!outcome.loading && !outcome.error && (
        <dl className="space-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-1.5 last:border-0">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-800 text-right">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Modal>
  );
}
