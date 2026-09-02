/**
 * Run an async function on mount (and whenever `deps` change) and expose
 * `{ data, error, loading, reload }`. Errors are normalized to `ApiError`.
 *
 * `loading` is derived: it stays `true` (and `data`/`error` read as empty)
 * whenever the resolved result does not belong to the current `deps` — so a
 * stale result from a previous key is never reported as "loaded".
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {ReadonlyArray<unknown>} [deps]
 * @returns {{ data: T|undefined, error: import('../api').ApiError|null, loading: boolean, reload: () => void }}
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api';

const toError = (err) =>
  err instanceof ApiError
    ? err
    : new ApiError({ statusCode: 0, message: err?.message || 'Request failed', kind: 'network' });

function depsKey(deps) {
  return deps
    .map((d) => (d !== null && typeof d === 'object' ? JSON.stringify(d) : String(d)))
    .join('|');
}

export function useAsync(fn, deps = []) {
  const key = depsKey(deps);
  const [state, setState] = useState({ data: undefined, error: null, key: null });

  // Hold the latest callback without making it a dependency of `run`.
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  // Starts a fetch for the current key. Returns a Promise (so callers can await
  // `reload()`) with a `.cancel()` so a superseded run never commits.
  // Note: no synchronous setState here.
  const run = useCallback(() => {
    let cancelled = false;
    const p = Promise.resolve()
      .then(() => fnRef.current())
      .then((data) => {
        if (!cancelled) setState({ data, error: null, key });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: undefined, error: toError(err), key });
      });
    p.cancel = () => {
      cancelled = true;
    };
    return p;
  }, [key]);

  useEffect(() => {
    const p = run();
    return () => p.cancel();
  }, [run]);

  const fresh = state.key === key;
  return {
    data: fresh ? state.data : undefined,
    error: fresh ? state.error : null,
    loading: !fresh,
    reload: run
  };
}
