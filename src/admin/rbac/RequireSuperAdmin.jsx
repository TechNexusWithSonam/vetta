import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useSuperAdmin } from './useSuperAdmin.js';
import { LoadingState } from '../../components/ui';

/**
 * Full gate for the `/admin/*` tree — deliberately independent of the
 * customer `RequireAuth` (no email-verification/onboarding detour; a super
 * admin shouldn't be routed through the customer signup funnel). Same
 * backend session (`useAuth()`), its own dedicated sign-in page.
 *
 * - Session still resolving  -> loading state.
 * - Not signed in            -> `/admin/login`, remembering the intended path.
 * - Signed in, not allow-listed -> `/admin/login` with a denied banner.
 * - Otherwise                -> render the admin app.
 */
export default function RequireSuperAdmin({ children }) {
  const { status } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();
  const location = useLocation();

  if (status === 'loading') return <LoadingState label="Checking access…" />;

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin/login" replace state={{ denied: true }} />;
  }

  return children;
}
