/**
 * Recording metadata via `voice.calls.recording`. The endpoint deliberately
 * never returns a provider-hosted URL (see the doc comment in
 * `src/api/resources/voice.js`), so there is nothing to play back — this
 * renders whatever metadata fields are present and says so plainly rather
 * than inventing a player or a fake URL.
 */
import React from 'react';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { SkeletonText, ErrorState } from '../ui';
import { humanize, duration } from '../../lib/format';

export default function RecordingSection({ callId }) {
  const rec = useAsync(() => api.voice.calls.recording(callId), [callId]);

  if (rec.loading) return <SkeletonText lines={2} />;
  if (rec.error) return <ErrorState error={rec.error} onRetry={rec.reload} compact />;

  const data = rec.data;
  const hasData = data && typeof data === 'object' && Object.keys(data).length > 0;
  if (!hasData) {
    return <p className="text-xs text-slate-400">No recording available for this call.</p>;
  }

  return (
    <dl className="text-xs text-slate-600 space-y-1">
      {data.durationSeconds != null && (
        <div className="flex justify-between">
          <dt>Duration</dt>
          <dd>{duration(data.durationSeconds)}</dd>
        </div>
      )}
      {data.status && (
        <div className="flex justify-between">
          <dt>Status</dt>
          <dd>{humanize(String(data.status))}</dd>
        </div>
      )}
      {data.format && (
        <div className="flex justify-between">
          <dt>Format</dt>
          <dd>{String(data.format)}</dd>
        </div>
      )}
      {data.sizeBytes != null && (
        <div className="flex justify-between">
          <dt>Size</dt>
          <dd>{(data.sizeBytes / 1024).toFixed(0)} KB</dd>
        </div>
      )}
      <p className="pt-1 text-slate-400">
        Playback isn't available here — the API returns recording metadata only, never a hosted audio URL.
      </p>
    </dl>
  );
}
