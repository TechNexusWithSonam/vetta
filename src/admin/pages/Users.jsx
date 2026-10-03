import { useMemo, useState } from 'react';
import { MoreHorizontal, Eye, UserCog, ShieldCheck, Ban, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/useAuth';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { useDebounced } from '../lib/useDebounced.js';
import { adminErrorMessage, friendlyError } from '../lib/adminErrors.js';
import { cleanParams, fullName } from '../lib/format.js';
import { SectionHeader, DataTable, FilterBar, StatusBadge, DetailList } from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import {
  Badge, Button, Dropdown, DropdownItem, DropdownSeparator, ErrorState, LoadingState, Modal, Select, Textarea, useToast,
} from '../../components/ui';
import { relativeTime, dateTime, num } from '../../lib/format';

const ROLE_OPTIONS = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MEMBER', label: 'Member' },
];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];
const PLATFORM_OPTIONS = [{ value: 'any', label: 'Platform operators' }];
const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'email:asc', label: 'Email A–Z' },
];

function ChangeRoleModal({ userRow, onClose, onSaved }) {
  const [role, setRole] = useState(userRow.role);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.users.updateRole(userRow.id, { role });
      toast.success('Role updated');
      onSaved();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to update role'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title={`Organization role — ${fullName(userRow) !== '—' ? fullName(userRow) : userRow.email}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={role === userRow.role}>Save</Button>
        </>
      }
    >
      <Select label={`Role in ${userRow.organizationName}`} value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} />
      <p className="mt-3 text-xs text-slate-500">An organization must always keep at least one active owner.</p>
    </Modal>
  );
}

function PlatformRoleModal({ userRow, onClose, onSaved }) {
  const roles = useAdminQuery((signal) => api.admin.roles.list({ signal }), []);
  const [roleId, setRoleId] = useState(userRow.platformRole?.id || '');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.users.assignPlatformRole(userRow.id, { platformRoleId: roleId || null });
      toast.success(roleId ? 'Platform role assigned' : 'Platform access removed');
      onSaved();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to update platform role'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title={`Platform access — ${userRow.email}`}
      description="Grants access to this Super Admin panel. Unrelated to the user's role inside their own organization."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={roles.loading || roleId === (userRow.platformRole?.id || '')}>Save</Button>
        </>
      }
    >
      {roles.error ? (
        <ErrorState error={friendlyError(roles.error)} onRetry={roles.reload} />
      ) : (
        <Select
          label="Platform role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          options={[{ value: '', label: 'No platform access' }, ...(roles.data || []).map((r) => ({ value: r.id, label: r.name }))]}
        />
      )}
    </Modal>
  );
}

function StatusChangeModal({ pending, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const suspend = pending.type === 'suspend';

  const confirm = async () => {
    setLoading(true);
    try {
      if (suspend) await api.admin.users.suspend(pending.row.id, { reason: reason.trim() || undefined });
      else await api.admin.users.activate(pending.row.id, { reason: reason.trim() || undefined });
      toast.success(suspend ? 'User suspended' : 'User activated');
      onDone();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Action failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      onClose={loading ? undefined : onClose}
      title={suspend ? 'Suspend user' : 'Activate user'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={suspend ? 'danger' : 'primary'} onClick={confirm} loading={loading}>{suspend ? 'Suspend' : 'Activate'}</Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        {pending.row.email} will {suspend ? 'be signed out and lose' : 'regain'} access immediately.
      </p>
      <div className="mt-4">
        <Textarea label="Reason" optional rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Recorded in the audit log" />
      </div>
    </Modal>
  );
}

function UserDetailModal({ userId, onClose }) {
  const q = useAdminQuery((signal) => api.admin.users.get(userId, { signal }), [userId]);
  const u = q.data;
  return (
    <Modal open onClose={onClose} title="User details" size="lg">
      {q.loading ? <LoadingState label="Loading user…" /> : q.error ? <ErrorState error={friendlyError(q.error)} onRetry={q.reload} /> : (
        <DetailList
          items={[
            { label: 'Name', value: fullName(u) },
            { label: 'Email', value: u.email },
            { label: 'Organization', value: u.organizationName },
            { label: 'Organization status', value: <StatusBadge status={u.organizationActive ? 'active' : 'suspended'} domain="organization" /> },
            { label: 'Role', value: u.role },
            { label: 'Status', value: <StatusBadge status={u.status} domain="user" /> },
            { label: 'Platform access', value: u.platformRole ? `${u.platformRole.name}${u.platformRole.bootstrap ? ' (bootstrap)' : ''}` : 'None' },
            { label: 'Active sessions', value: num(u.activeSessions) },
            { label: 'Calls requested', value: num(u.callsRequested) },
            { label: 'Last active', value: u.lastActiveAt ? dateTime(u.lastActiveAt) : 'Never' },
            { label: 'Created', value: dateTime(u.createdAt) },
            { label: 'User ID', value: <code className="text-xs">{u.id}</code> },
          ]}
        />
      )}
    </Modal>
  );
}

export default function AdminUsers() {
  const { can } = useAdminAccess();
  const { user: me } = useAuth();
  const canManage = can(P.USERS_MANAGE);
  const canRoles = can(P.ROLES_MANAGE);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [platform, setPlatform] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type, row }
  const limit = 10;
  const debouncedSearch = useDebounced(search);

  const query = useMemo(() => {
    const [sortBy, sortOrder] = sort.split(':');
    return cleanParams({ page, limit, search: debouncedSearch.trim(), role, status, platformRoleId: platform, sortBy, sortOrder });
  }, [page, debouncedSearch, role, status, platform, sort]);
  const list = useAdminQuery((signal) => api.admin.users.list(query, { signal }), [query]);
  const resetPage = (fn) => (v) => { fn(v); setPage(1); };
  const closeAndReload = () => { setModal(null); list.reload(); };

  const columns = [
    { key: 'name', header: 'Name', render: (u) => fullName(u) },
    { key: 'email', header: 'Email' },
    { key: 'organizationName', header: 'Organization' },
    { key: 'role', header: 'Role' },
    { key: 'platformRole', header: 'Platform', render: (u) => (u.platformRole ? <Badge tone="brand" size="sm">{u.platformRole.name}</Badge> : <span className="text-slate-400">—</span>) },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} domain="user" /> },
    { key: 'lastActiveAt', header: 'Last active', render: (u) => relativeTime(u.lastActiveAt) || 'Never' },
    { key: 'createdAt', header: 'Created', render: (u) => dateTime(u.createdAt) },
    {
      key: 'actions', header: '', align: 'right', render: (u) => (
        <Dropdown
          trigger={<MoreHorizontal size={16} />}
          triggerClassName="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          align="end"
          aria-label="User actions"
        >
          <DropdownItem icon={Eye} onSelect={() => setModal({ type: 'detail', row: u })}>View details</DropdownItem>
          {canManage && <DropdownItem icon={UserCog} onSelect={() => setModal({ type: 'role', row: u })}>Change org role</DropdownItem>}
          {canRoles && u.id !== me?.id && !u.platformRole?.bootstrap && (
            <DropdownItem icon={ShieldCheck} onSelect={() => setModal({ type: 'platform', row: u })}>Platform access</DropdownItem>
          )}
          {canManage && u.id !== me?.id && (
            <>
              <DropdownSeparator />
              {u.status === 'suspended' ? (
                <DropdownItem icon={CheckCircle2} onSelect={() => setModal({ type: 'activate', row: u })}>Activate</DropdownItem>
              ) : (
                <DropdownItem icon={Ban} danger onSelect={() => setModal({ type: 'suspend', row: u })}>Suspend</DropdownItem>
              )}
            </>
          )}
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Users"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Users' }]}
        description="Platform-level user directory across every organization."
      />

      <FilterBar
        search={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder="Search by name or email…"
        filters={[
          { key: 'role', value: role, onChange: resetPage(setRole), options: ROLE_OPTIONS, placeholder: 'All roles' },
          { key: 'status', value: status, onChange: resetPage(setStatus), options: STATUS_OPTIONS, placeholder: 'All statuses' },
          { key: 'platform', value: platform, onChange: resetPage(setPlatform), options: PLATFORM_OPTIONS, placeholder: 'All users' },
          { key: 'sort', value: sort, onChange: resetPage(setSort), options: SORT_OPTIONS, placeholder: 'Sort' },
        ]}
      />

      <DataTable
        columns={columns}
        rows={list.data?.data || []}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle={debouncedSearch || role || status || platform ? 'No users match these filters' : 'No users yet'}
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />

      {modal?.type === 'detail' && <UserDetailModal userId={modal.row.id} onClose={() => setModal(null)} />}
      {modal?.type === 'role' && <ChangeRoleModal userRow={modal.row} onClose={() => setModal(null)} onSaved={closeAndReload} />}
      {modal?.type === 'platform' && <PlatformRoleModal userRow={modal.row} onClose={() => setModal(null)} onSaved={closeAndReload} />}
      {(modal?.type === 'suspend' || modal?.type === 'activate') && (
        <StatusChangeModal pending={modal} onClose={() => setModal(null)} onDone={closeAndReload} />
      )}
    </div>
  );
}
