import { useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { isSuperAdmin } from './superAdminGate.js';
import { ROLES, ROLE_PERMISSIONS } from './roles.js';

/**
 * @returns {{ isSuperAdmin: boolean, permissions: string[], can: (permission?: string) => boolean }}
 */
export function useSuperAdmin() {
  const { user } = useAuth();
  const superAdmin = isSuperAdmin(user);

  return useMemo(() => {
    const permissions = superAdmin ? ROLE_PERMISSIONS[ROLES.SUPER_ADMIN] : [];
    return {
      isSuperAdmin: superAdmin,
      permissions,
      can: (permission) => (permission ? permissions.includes(permission) : superAdmin),
    };
  }, [superAdmin]);
}

export default useSuperAdmin;
