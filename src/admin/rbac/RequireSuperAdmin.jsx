import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ErrorState, LoadingState } from '../../components/ui';
import { friendlyError } from '../lib/adminErrors.js';
import { AdminAccessProvider, useAdminAccess } from './AdminAccessContext.jsx';

/**
 * Full gate for the `/admin/*` tree — independent of the customer
 * `RequireAuth` funnel. Access is whatever the server says `GET /admin/me`:
 *
 * - Session still resolving       -> loading state.
 * - Not signed in                 -> `/admin/login`, remembering the path.
 * - Signed in, server says 401/403 -> `/admin/login` with a denied banner.
 * - Server unreachable / 5xx      -> error with retry (never a blank screen).
 * - Otherwise                     -> render the admin app.
 */
function Gate({ children }) {
  const { status } = useAuth();
  const access = useAdminAccess();
  const location = useLocation();

  if (status === 'loading' || access.status === 'loading') {
    return <LoadingState label="Checking access…" />;
  }
  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (access.status === 'denied') {
    return <Navigate to="/admin/login" replace state={{ denied: true }} />;
  }
  if (access.status === 'error') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg">
          <ErrorState error={friendlyError(access.error)} onRetry={access.refresh} title="Couldn’t verify admin access" />
        </div>
      </div>
    );
  }
  return children;
}

export default function RequireSuperAdmin({ children }) {
  return (
    <AdminAccessProvider>
      <Gate>{children}</Gate>
    </AdminAccessProvider>
  );
}
