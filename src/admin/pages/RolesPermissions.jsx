import { Fragment, useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/useAuth';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { logAdminAction } from '../lib/auditLog.js';
import { SectionHeader, DemoDataBadge } from '../components';
import { PERMISSION_CATALOG, permissionLabel } from '../rbac/permissions.js';
import { LoadingState, ErrorState, useToast } from '../../components/ui';

export default function RolesPermissions() {
  const { user: actor } = useAuth();
  const toast = useToast();
  const roles = useAdminAsync(() => api.admin.roles.listRoles(), []);
  const [saving, setSaving] = useState(null); // roleId currently saving
  const [localPermissions, setLocalPermissions] = useState({});

  const list = roles.data || [];
  const permsFor = (role) => localPermissions[role.id] ?? role.permissions;

  const togglePermission = async (role, key) => {
    if (role.isSystem) return; // Super Admin always has every permission
    const current = permsFor(role);
    const next = current.includes(key) ? current.filter((p) => p !== key) : [...current, key];
    setLocalPermissions((prev) => ({ ...prev, [role.id]: next }));
    setSaving(role.id);
    try {
      await api.admin.roles.updateRolePermissions(role.id, { permissions: next });
      await logAdminAction({
        action: 'role.permissions_update', entityType: 'role', entityId: role.id,
        summary: `Updated permissions for ${role.name}`, metadata: { permissions: next }, actor,
      });
    } catch (err) {
      toast.error(err?.message || 'Failed to update permissions');
      setLocalPermissions((prev) => ({ ...prev, [role.id]: current }));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Roles & Permissions"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Roles & Permissions' }]}
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Changes here are recorded in Audit Logs but not yet enforced server-side.</p>
          <p className="mt-1">
            The real Super Admin gate today is a client-side email allow-list (see <code>VITE_SUPER_ADMIN_EMAILS</code>), because the
            backend has no platform role concept yet. This matrix is the intended contract for when the backend adds real RBAC enforcement.
          </p>
        </div>
      </div>

      {roles.loading ? (
        <LoadingState label="Loading roles…" />
      ) : roles.error ? (
        <ErrorState error={roles.error} onRetry={roles.reload} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {roles.isMock && <div className="p-4 border-b border-slate-100"><DemoDataBadge /></div>}
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Permission</th>
                {list.map((role) => (
                  <th key={role.id} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_CATALOG.map((group) => (
                <Fragment key={group.category}>
                  <tr className="bg-slate-50/60">
                    <td colSpan={list.length + 1} className="px-4 py-2 text-xs font-semibold text-slate-500">{group.category}</td>
                  </tr>
                  {group.keys.map((key) => (
                    <tr key={key}>
                      <td className="px-4 py-2.5 text-slate-700">{permissionLabel(key)}</td>
                      {list.map((role) => {
                        const has = permsFor(role).includes(key);
                        return (
                          <td key={role.id} className="px-4 py-2.5 text-center">
                            <button
                              disabled={role.isSystem || saving === role.id}
                              onClick={() => togglePermission(role, key)}
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                                has ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300 text-transparent'
                              } ${role.isSystem ? 'opacity-60 cursor-not-allowed' : 'hover:border-brand-400'}`}
                              aria-label={has ? 'Enabled' : 'Disabled'}
                            >
                              <Check size={14} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
