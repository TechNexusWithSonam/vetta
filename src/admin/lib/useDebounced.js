import { useEffect, useState } from 'react';

/** Debounce a fast-changing value (e.g. a search box) so typing doesn't fire a request per keystroke. */
export function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default useDebounced;
