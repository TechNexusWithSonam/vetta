import { Navigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { EmptyState } from '../../components/ui';
import { firstAllowedPath } from '../layout/adminNav.js';
import { useAdminAccess } from './AdminAccessContext.jsx';

/**
 * Per-page gate inside the admin layout. Presentation only: it saves the
 * operator from a page of 403s — the API enforces the same permission.
 */
export default function RequirePermission({ permission, children }) {
  const { can } = useAdminAccess();
  if (can(permission)) return children;
  return (
    <EmptyState
      icon={ShieldOff}
      title="You don’t have access to this section"
      hint="Ask a Super Admin to grant your platform role the required permission."
    />
  );
}

/** `/admin` index: the dashboard if permitted, otherwise the first section this operator can open. */
export function AdminHome() {
  const { can } = useAdminAccess();
  const target = firstAllowedPath(can);
  if (!target) {
    return <EmptyState icon={ShieldOff} title="No sections available" hint="Your platform role has no permissions yet." />;
  }
  return <Navigate to={target} replace />;
}
