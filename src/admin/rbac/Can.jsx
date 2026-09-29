import { useAdminAccess } from './AdminAccessContext.jsx';

/**
 * Render `children` only if the signed-in operator holds `permission`
 * (as reported by `GET /admin/me`). Presentation only — the API enforces
 * the same permission on every request.
 */
export function Can({ permission, fallback = null, children }) {
  const { can } = useAdminAccess();
  return can(permission) ? children : fallback;
}

export default Can;
