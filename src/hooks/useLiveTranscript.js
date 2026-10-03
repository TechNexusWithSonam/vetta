/**
 * Polls `voice.calls.transcript(callId)` for a call's turns, reconciling each
 * fetch's full array against the previous one so unchanged turns keep stable
 * object identity (cheap re-render skip, stable scroll anchoring) while
 * genuinely new or updated turns are detected. Nudges the provider via
 * `voice.calls.sync(callId)` before each poll while `live`.
 *
 * `voice.calls.transcript` returns the full ordered array every call, not a
 * delta or a stream — there is no per-turn webhook or WebSocket in the
 * backend's contract (see BACKEND_ISSUES.md). This hook is the frontend's
 * only available mechanism: short-interval polling, done as correctly as
 * possible (dedup, stable identity, graceful degradation) rather than a
 * naive full-replace-on-every-poll.
 */
import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../api';

const POLL_MS = 5000;
const RECONNECT_AFTER_FAILURES = 2;

/** Stable identity for a turn: prefer a real id, else timestamp+speaker+content. */
function turnKey(turn) {
  if (turn.id != null) return `id:${turn.id}`;
  const ts = turn.timestamp ?? turn.createdAt ?? turn.ts ?? '';
  const speaker = turn.speaker ?? turn.role ?? turn.from ?? '';
  const content = turn.text ?? turn.content ?? turn.message ?? '';
  return `k:${ts}|${speaker}|${content}`;
}

function sameTurn(a, b) {
  return (
    (a.text ?? a.content ?? a.message) === (b.text ?? b.content ?? b.message) &&
    (a.status ?? null) === (b.status ?? null)
  );
}

function unwrapTurns(data) {
  return Array.isArray(data) ? data : (data?.turns ?? []);
}

/**
 * @param {string} callId
 * @param {{ live: boolean }} options
 * @returns {{ turns: Array<{key: string, raw: object}>, loading: boolean, unavailable: boolean, reconnecting: boolean, reload: () => void }}
 */
export function useLiveTranscript(callId, { live }) {
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);

  const turnsMapRef = useRef(new Map());
  const turnsCountRef = useRef(0); // mirrors turns.length without a stale-closure risk inside the interval callback
  const failuresRef = useRef(0);
  const inFlightRef = useRef(false);

  const reconcile = (data) => {
    const incoming = unwrapTurns(data);
    const prevMap = turnsMapRef.current;
    const nextMap = new Map();
    for (const raw of incoming) {
      const key = turnKey(raw);
      const prev = prevMap.get(key);
      nextMap.set(key, prev && sameTurn(prev.raw, raw) ? prev : { key, raw });
    }
    turnsMapRef.current = nextMap;
    turnsCountRef.current = nextMap.size;
    setTurns([...nextMap.values()]);
  };

  const fetchOnce = async (callSyncFirst) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      if (callSyncFirst) {
        await api.voice.calls.sync(callId).catch(() => {}); // best-effort nudge, never blocks the read
      }
      const data = await api.voice.calls.transcript(callId);
      reconcile(data);
      setError(null);
      failuresRef.current = 0;
      setReconnecting(false);
    } catch (err) {
      failuresRef.current += 1;
      const apiErr = err instanceof ApiError ? err : new ApiError({ statusCode: 0, message: 'Failed to load transcript' });
      setError(apiErr);
      if (live && turnsCountRef.current > 0 && failuresRef.current >= RECONNECT_AFTER_FAILURES) {
        setReconnecting(true);
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  // Reset on call change, then fetch once immediately regardless of `live` —
  // reopening a terminal call should show its stored transcript right away.
  useEffect(() => {
    turnsMapRef.current = new Map();
    failuresRef.current = 0;
    inFlightRef.current = false;
    setTurns([]);
    setError(null);
    setReconnecting(false);
    turnsCountRef.current = 0;
    setLoading(true);
    fetchOnce(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId]);

  // Poll while live; no interval at all once terminal (sync is a no-op then anyway).
  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) fetchOnce(true);
    }, POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, live]);

  const reload = () => fetchOnce(live);

  return {
    turns,
    loading,
    unavailable: Boolean(error) && turns.length === 0,
    reconnecting,
    reload,
  };
}

export default useLiveTranscript;
