import { useSuperAdmin } from './useSuperAdmin.js';

/** Render `children` only if the current super-admin session has `permission`. */
export function Can({ permission, fallback = null, children }) {
  const { can } = useSuperAdmin();
  return can(permission) ? children : fallback;
}

export default Can;
