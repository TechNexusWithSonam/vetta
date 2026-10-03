import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api';

/**
 * Admin data hook: runs `fn(signal)` on mount and whenever `deps` change,
 * aborting the in-flight request when superseded or unmounted (so fast
 * filter/page changes never race and never set state after unmount).
 *
 * Returns `{ data, error, loading, reload }`. `data` keeps the last
 * successful result for the *current* deps only — a stale page is never
 * shown as the answer to a new query.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} fn
 * @param {ReadonlyArray<unknown>} deps
 */
export function useAdminQuery(fn, deps = []) {
  const key = JSON.stringify(deps);
  const [state, setState] = useState({ key: null, data: undefined, error: null });
  const [nonce, setNonce] = useState(0);
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve()
      .then(() => fnRef.current(controller.signal))
      .then(
        (data) => {
          if (!controller.signal.aborted) setState({ key, data, error: null });
        },
        (err) => {
          if (controller.signal.aborted) return;
          setState({ key, data: undefined, error: toApiError(err) });
        },
      );
    return () => controller.abort();
  }, [key, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const fresh = state.key === key;
  return {
    data: fresh ? state.data : undefined,
    error: fresh ? state.error : null,
    loading: !fresh,
    reload,
  };
}

function toApiError(err) {
  return err instanceof ApiError
    ? err
    : new ApiError({ statusCode: 0, message: err?.message || 'Request failed', kind: 'network' });
}

export default useAdminQuery;
