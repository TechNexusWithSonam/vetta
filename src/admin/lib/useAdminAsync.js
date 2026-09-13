import { useAsync } from '../../hooks/useAsync';

/**
 * Thin flattening wrapper over the app's existing `useAsync`, for calls built
 * with `withMockFallback` (which resolve to `{ data, isMock }`).
 * @returns {{ data: any, isMock: boolean, error: import('../../api').ApiError|null, loading: boolean, reload: () => void }}
 */
export function useAdminAsync(fn, deps = []) {
  const { data, error, loading, reload } = useAsync(fn, deps);
  return { data: data?.data, isMock: data?.isMock ?? false, error, loading, reload };
}

export default useAdminAsync;
