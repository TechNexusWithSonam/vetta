import { useMemo, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/useAuth';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { logAdminAction } from '../lib/auditLog.js';
import { SectionHeader, DataTable, FilterBar, StatusBadge } from '../components';
import { Button, Select, Modal, ConfirmDialog, useToast } from '../../components/ui';
import { relativeTime, dateTime } from '../../lib/format';

const ROLE_OPTIONS = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MEMBER', label: 'Member' },
];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'suspended', label: 'Suspended' },
];

function ChangeRoleModal({ userRow, onClose, onSaved }) {
  const [role, setRole] = useState(userRow.role);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { user: actor } = useAuth();

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.users.updateRole(userRow.id, { role });
      await logAdminAction({
        action: 'user.role_change', entityType: 'user', entityId: userRow.id, organizationId: userRow.organizationId,
        summary: `Changed ${userRow.email}'s role to ${role}`, metadata: { from: userRow.role, to: role }, actor,
      });
      toast.success('Role updated');
      onSaved();
    } catch (err) {
      toast.error(err?.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Change role — ${userRow.firstName} ${userRow.lastName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save</Button>
        </>
      }
    >
      <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} />
    </Modal>
  );
}

export default function AdminUsers() {
  const { user: actor } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [changingRole, setChangingRole] = useState(null);
  const [pending, setPending] = useState(null); // { row, type: 'suspend'|'activate' }
  const [actionLoading, setActionLoading] = useState(false);
  const limit = 10;

  const query = useMemo(() => ({ page, limit, search: search || undefined, role: role || undefined, status: status || undefined }), [page, search, role, status]);
  const list = useAdminAsync(() => api.admin.users.list(query), [JSON.stringify(query)]);
  const items = list.data?.items || [];

  const confirmPending = async () => {
    if (!pending) return;
    setActionLoading(true);
    const { row, type } = pending;
    try {
      if (type === 'suspend') await api.admin.users.suspend(row.id, { reason: 'Manual suspension' });
      else await api.admin.users.activate(row.id);
      await logAdminAction({
        action: type === 'suspend' ? 'user.suspend' : 'user.activate', entityType: 'user', entityId: row.id,
        organizationId: row.organizationId, summary: `${type === 'suspend' ? 'Suspended' : 'Activated'} ${row.email}`, actor,
      });
      toast.success(type === 'suspend' ? 'User suspended' : 'User activated');
      setPending(null);
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (u) => `${u.firstName} ${u.lastName}` },
    { key: 'email', header: 'Email' },
    { key: 'organizationName', header: 'Organization' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} domain="user" /> },
    { key: 'lastActiveAt', header: 'Last active', render: (u) => relativeTime(u.lastActiveAt) },
    { key: 'createdAt', header: 'Created', render: (u) => dateTime(u.createdAt) },
    {
      key: 'actions', header: '', align: 'right', render: (u) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setChangingRole(u)}>Change role</Button>
          {u.status === 'suspended' ? (
            <Button size="sm" variant="secondary" onClick={() => setPending({ row: u, type: 'activate' })}>Activate</Button>
          ) : (
            <Button size="sm" variant="danger" onClick={() => setPending({ row: u, type: 'suspend' })}>Suspend</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Users"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Users' }]}
        description="Platform-level user directory across every organization. This is distinct from an organization's own team members list."
      />

      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or email…"
        filters={[
          { key: 'role', value: role, onChange: (v) => { setRole(v); setPage(1); }, options: ROLE_OPTIONS, placeholder: 'All roles' },
          { key: 'status', value: status, onChange: (v) => { setStatus(v); setPage(1); }, options: STATUS_OPTIONS, placeholder: 'All statuses' },
        ]}
      />

      <DataTable
        columns={columns}
        rows={items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        isMock={list.isMock}
        emptyTitle="No users match these filters"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />

      {changingRole && (
        <ChangeRoleModal userRow={changingRole} onClose={() => setChangingRole(null)} onSaved={() => { setChangingRole(null); list.reload(); }} />
      )}

      {pending && (
        <ConfirmDialog
          open
          onClose={() => setPending(null)}
          onConfirm={confirmPending}
          title={pending.type === 'suspend' ? 'Suspend user' : 'Activate user'}
          message={`${pending.row.email} will ${pending.type === 'suspend' ? 'lose' : 'regain'} access immediately.`}
          confirmLabel={pending.type === 'suspend' ? 'Suspend' : 'Activate'}
          tone={pending.type === 'suspend' ? 'danger' : 'primary'}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
