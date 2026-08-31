/**
 * Run an async function on mount (and whenever `deps` change) and expose
 * `{ data, error, loading, reload }`. Errors are normalized to `ApiError`.
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {ReadonlyArray<unknown>} [deps]
 * @returns {{ data: T|undefined, error: import('../api').ApiError|null, loading: boolean, reload: () => void }}
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api';

export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const callId = useRef(0);

  const run = useCallback(() => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(() => fnRef.current())
      .then((data) => {
        if (id === callId.current) setState({ data, error: null, loading: false });
      })
      .catch((err) => {
        if (id !== callId.current) return;
        const error =
          err instanceof ApiError
            ? err
            : new ApiError({ statusCode: 0, message: err?.message || 'Request failed', kind: 'network' });
        setState({ data: undefined, error, loading: false });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    return () => {
      // Invalidate any in-flight result from this effect.
      callId.current += 1;
    };
  }, [run]);

  return { ...state, reload: run };
}
