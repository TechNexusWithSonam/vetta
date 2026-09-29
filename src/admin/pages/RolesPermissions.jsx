import { Fragment, useState } from 'react';
import { Check, Info, Plus, Trash2, UserMinus } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/useAuth';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { useDebounced } from '../lib/useDebounced.js';
import { adminErrorMessage, friendlyError } from '../lib/adminErrors.js';
import { SectionHeader, DataTable } from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import { Badge, Button, ConfirmDialog, ErrorState, Input, LoadingState, Modal, Select, Textarea, useToast } from '../../components/ui';

function RoleModal({ onClose, onSaved }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.roles.create({ name: name.trim(), description: description.trim() || undefined, permissions: [] });
      toast.success('Role created — now grant it permissions in the matrix');
      onSaved();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to create role'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title="New platform role"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={name.trim().length < 2}>Create role</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Support, Finance" required />
        <Textarea label="Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} optional />
      </div>
    </Modal>
  );
}

function AddMemberModal({ role, onClose, onSaved }) {
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search);
  const [userId, setUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const users = useAdminQuery(
    (signal) => (debounced.trim().length >= 2 ? api.admin.users.list({ search: debounced.trim(), limit: 10 }, { signal }) : Promise.resolve({ data: [] })),
    [debounced],
  );
  const options = (users.data?.data || []).map((u) => ({
    value: u.id,
    label: `${u.email} — ${u.organizationName}${u.platformRole ? ` (currently ${u.platformRole.name})` : ''}`,
    disabled: u.platformRole?.bootstrap,
  }));

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.users.assignPlatformRole(userId, { platformRoleId: role.id });
      toast.success(`Added to ${role.name}`);
      onSaved();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to assign role'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title={`Add member — ${role.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={!userId}>Add member</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Find user" placeholder="Type at least 2 characters of a name or email…" value={search} onChange={(e) => { setSearch(e.target.value); setUserId(''); }} />
        {users.error ? (
          <p className="text-sm text-rose-600">{adminErrorMessage(users.error)}</p>
        ) : (
          <Select value={userId} onChange={(e) => setUserId(e.target.value)} placeholder={options.length ? 'Select a user' : 'No matching users'} options={options} />
        )}
        <p className="text-xs text-slate-500">A user holds at most one platform role; adding them here replaces any role they have.</p>
      </div>
    </Modal>
  );
}

function Members({ role, canManage, onChanged }) {
  const { user: me } = useAuth();
  const toast = useToast();
  const members = useAdminQuery((signal) => api.admin.roles.members(role.id, { signal }), [role.id, role.memberCount]);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await api.admin.users.assignPlatformRole(removing.id, { platformRoleId: null });
      toast.success('Platform access removed');
      setRemoving(null);
      onChanged();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to remove member'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Members of {role.name}</h3>
        {canManage && <Button size="sm" iconLeft={Plus} onClick={() => setAdding(true)}>Add member</Button>}
      </div>
      <DataTable
        columns={[
          { key: 'email', header: 'Email' },
          { key: 'name', header: 'Name', render: (m) => m.name || '—' },
          { key: 'organizationName', header: 'Organization' },
          { key: 'status', header: 'Status', render: (m) => m.status },
          {
            key: 'actions', header: '', align: 'right', render: (m) => canManage && m.id !== me?.id && (
              <Button size="sm" variant="ghost" iconLeft={UserMinus} onClick={() => setRemoving(m)}>Remove</Button>
            ),
          },
        ]}
        rows={members.data || []}
        loading={members.loading}
        error={members.error}
        onRetry={members.reload}
        emptyTitle="No users hold this role"
      />
      {adding && <AddMemberModal role={role} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); onChanged(); }} />}
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        title="Remove platform access"
        message={removing ? `${removing.email} will lose access to the admin panel immediately.` : ''}
        confirmLabel="Remove"
        tone="danger"
        loading={busy}
      />
    </div>
  );
}

export default function RolesPermissions() {
  const { can, refresh: refreshMyAccess } = useAdminAccess();
  const canManage = can(P.ROLES_MANAGE);
  const toast = useToast();
  const catalog = useAdminQuery((signal) => api.admin.roles.permissionCatalog({ signal }), []);
  const roles = useAdminQuery((signal) => api.admin.roles.list({ signal }), []);
  const [overrides, setOverrides] = useState({}); // roleId -> permissions (optimistic)
  const [saving, setSaving] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const list = roles.data || [];
  const selected = list.find((r) => r.id === selectedId) || list[0];
  const permsFor = (role) => overrides[role.id] ?? role.permissions;

  const toggle = async (role, key) => {
    if (role.isSystem || !canManage) return;
    const current = permsFor(role);
    const next = current.includes(key) ? current.filter((p) => p !== key) : [...current, key];
    setOverrides((o) => ({ ...o, [role.id]: next }));
    setSaving(role.id);
    try {
      await api.admin.roles.update(role.id, { permissions: next });
      refreshMyAccess(); // in case the operator edited a role they hold
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to update permissions'));
      setOverrides((o) => ({ ...o, [role.id]: current }));
    } finally {
      setSaving(null);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.admin.roles.remove(deleting.id);
      toast.success('Role deleted');
      setDeleting(null);
      setSelectedId(null);
      roles.reload();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to delete role'));
    } finally {
      setBusy(false);
    }
  };

  const loading = catalog.loading || roles.loading;
  const error = catalog.error || roles.error;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Roles & Permissions"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Roles & Permissions' }]}
        description="Platform (Super Admin panel) roles. These are separate from each organization's own Owner/Admin/Member roles."
        actions={canManage && <Button iconLeft={Plus} onClick={() => setCreating(true)}>New role</Button>}
      />

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <Info size={18} className="shrink-0 mt-0.5" />
        <p>
          Every permission is enforced by the API on each request. Built-in <strong>Super Admin</strong> always holds every
          permission; bootstrap operators are configured server-side via <code>PLATFORM_SUPER_ADMIN_EMAILS</code>.
        </p>
      </div>

      {loading ? (
        <LoadingState label="Loading roles…" />
      ) : error ? (
        <ErrorState error={friendlyError(error)} onRetry={() => { catalog.reload(); roles.reload(); }} />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Permission</th>
                  {list.map((role) => (
                    <th key={role.id} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <button onClick={() => setSelectedId(role.id)} className={`hover:text-brand-700 ${selected?.id === role.id ? 'text-brand-700 underline' : ''}`}>
                          {role.name}
                        </button>
                        <span className="normal-case font-normal text-slate-400">{role.memberCount} member(s)</span>
                        {role.isSystem ? (
                          <Badge tone="brand" size="sm">Built-in</Badge>
                        ) : canManage && (
                          <button onClick={() => setDeleting(role)} className="text-slate-400 hover:text-rose-600" aria-label={`Delete ${role.name}`}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(catalog.data || []).map((group) => (
                  <Fragment key={group.module}>
                    <tr className="bg-slate-50/60">
                      <td colSpan={list.length + 1} className="px-4 py-2 text-xs font-semibold text-slate-500">{group.module}</td>
                    </tr>
                    {group.permissions.map(({ key, label: permLabel }) => (
                      <tr key={key}>
                        <td className="px-4 py-2.5 text-slate-700">
                          {permLabel}
                          <span className="ml-2 text-xs text-slate-400">{key}</span>
                        </td>
                        {list.map((role) => {
                          const has = permsFor(role).includes(key);
                          const locked = role.isSystem || !canManage;
                          return (
                            <td key={role.id} className="px-4 py-2.5 text-center">
                              <button
                                disabled={locked || saving === role.id}
                                onClick={() => toggle(role, key)}
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                                  has ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300 text-transparent'
                                } ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:border-brand-400'}`}
                                aria-label={`${permLabel} for ${role.name}: ${has ? 'granted' : 'not granted'}`}
                                aria-pressed={has}
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

          {selected && <Members role={selected} canManage={canManage} onChanged={() => roles.reload()} />}
        </>
      )}

      {creating && <RoleModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); roles.reload(); }} />}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title="Delete role"
        message={deleting ? (deleting.memberCount > 0
          ? `${deleting.name} still has ${deleting.memberCount} member(s). Remove them first — the server will refuse otherwise.`
          : `Delete the ${deleting.name} role? This cannot be undone.`) : ''}
        confirmLabel="Delete"
        tone="danger"
        loading={busy}
      />
    </div>
  );
}
