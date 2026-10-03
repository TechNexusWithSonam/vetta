import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/useAuth';

/**
 * Platform-admin access, decided by the SERVER (`GET /admin/me`), never by
 * the client: the backend resolves the caller's platform role/permissions
 * (bootstrap Super Admin list or DB-assigned PlatformRole) and 403s anyone
 * else. The panel only mirrors that answer to hide/disable controls — every
 * /admin/* endpoint re-checks permissions on each request regardless.
 *
 * status: 'idle' (signed out) | 'loading' | 'granted' | 'denied' | 'error'
 */
const AdminAccessContext = createContext(null);

export function AdminAccessProvider({ children }) {
  const { status: authStatus, user } = useAuth();
  const [state, setState] = useState({ status: 'idle', access: null, error: null, userId: null });
  const [nonce, setNonce] = useState(0);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (authStatus !== 'authenticated') return undefined;
    const controller = new AbortController();
    api.admin
      .me({ signal: controller.signal })
      .then((access) => {
        if (!controller.signal.aborted) setState({ status: 'granted', access, error: null, userId });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        const denied = error?.statusCode === 403 || error?.statusCode === 401;
        setState({ status: denied ? 'denied' : 'error', access: null, error, userId });
      });
    return () => controller.abort();
  }, [authStatus, userId, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  const value = useMemo(() => {
    let status;
    if (authStatus === 'loading') status = 'loading';
    else if (authStatus !== 'authenticated') status = 'idle';
    else if (state.userId !== userId || state.status === 'idle') status = 'loading';
    else status = state.status;
    const access = status === 'granted' ? state.access : null;
    const permissions = access?.permissions ?? [];
    return {
      status,
      access,
      error: status === 'error' ? state.error : null,
      isSuperAdmin: !!access?.isSuperAdmin,
      permissions,
      can: (permission) => (permission ? permissions.includes(permission) : !!access),
      refresh,
    };
  }, [authStatus, userId, state, refresh]);

  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAccess() {
  const ctx = useContext(AdminAccessContext);
  if (!ctx) throw new Error('useAdminAccess must be used inside <AdminAccessProvider>');
  return ctx;
}
