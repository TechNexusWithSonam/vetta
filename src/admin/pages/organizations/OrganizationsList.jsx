import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Pencil, Ban, CheckCircle2, LogIn } from 'lucide-react';
import { api } from '../../../api';
import { useAdminQuery } from '../../lib/useAdminQuery.js';
import { adminErrorMessage } from '../../lib/adminErrors.js';
import { cleanParams } from '../../lib/format.js';
import { useDebounced } from '../../lib/useDebounced.js';
import { SectionHeader, DataTable, FilterBar, StatusBadge } from '../../components';
import { useAdminAccess } from '../../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../../rbac/permissions.js';
import { Button, Dropdown, DropdownItem, DropdownSeparator, Tooltip, Modal, Input, Textarea, useToast } from '../../../components/ui';
import { num, money, dateTime } from '../../../lib/format';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];
const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name A–Z' },
  { value: 'name:desc', label: 'Name Z–A' },
];

function EditOrganizationModal({ org, onClose, onSaved }) {
  const [name, setName] = useState(org.name);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.organizations.update(org.id, { name: name.trim() });
      toast.success('Organization updated');
      onSaved();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to update organization'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit organization"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={name.trim().length < 2}>Save changes</Button>
        </>
      }
    >
      <Input label="Organization name" value={name} onChange={(e) => setName(e.target.value)} required />
      <p className="mt-3 text-xs text-slate-500">Plan changes are made from the organization’s Subscription tab.</p>
    </Modal>
  );
}

/** Suspend/activate with a reason, behind a confirmation. Shared by the list and the detail header. */
export function OrgStatusDialog({ pending, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  if (!pending) return null;
  const suspend = pending.type === 'suspend';

  const confirm = async () => {
    setLoading(true);
    try {
      if (suspend) await api.admin.organizations.suspend(pending.org.id, { reason: reason || undefined });
      else await api.admin.organizations.activate(pending.org.id, { reason: reason || undefined });
      toast.success(suspend ? 'Organization suspended' : 'Organization activated');
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
      title={suspend ? 'Suspend organization' : 'Activate organization'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={suspend ? 'danger' : 'primary'} onClick={confirm} loading={loading}>
            {suspend ? 'Suspend' : 'Activate'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        {suspend
          ? `${pending.org.name}'s users will be signed out and blocked immediately. You can reactivate it at any time.`
          : `${pending.org.name}'s users will be able to sign in again immediately.`}
      </p>
      <div className="mt-4">
        <Textarea label="Reason" optional rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Recorded in the audit log" />
      </div>
    </Modal>
  );
}

export default function OrganizationsList() {
  const navigate = useNavigate();
  const { can } = useAdminAccess();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [planId, setPlanId] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [pending, setPending] = useState(null);
  const limit = 10;
  const debouncedSearch = useDebounced(search);
  const canManage = can(P.ORGANIZATIONS_MANAGE);

  const plans = useAdminQuery((signal) => (can(P.PLANS_VIEW) ? api.admin.plans.list({ signal }) : Promise.resolve([])), []);
  const planOptions = (plans.data || []).map((p) => ({ value: p.id, label: p.name }));

  const query = useMemo(() => {
    const [sortBy, sortOrder] = sort.split(':');
    return cleanParams({ page, limit, search: debouncedSearch.trim(), status, planId, sortBy, sortOrder });
  }, [page, debouncedSearch, status, planId, sort]);
  const list = useAdminQuery((signal) => api.admin.organizations.list(query, { signal }), [query]);
  const items = list.data?.data || [];

  const resetPage = (fn) => (v) => { fn(v); setPage(1); };

  const columns = [
    { key: 'name', header: 'Organization', render: (o) => (
      <button onClick={() => navigate(`/admin/organizations/${o.id}`)} className="font-medium text-slate-800 hover:text-brand-700 hover:underline text-left">
        {o.name}
      </button>
    ) },
    { key: 'owner', header: 'Owner', render: (o) => <span className="text-slate-600">{o.ownerEmail || '—'}</span> },
    { key: 'planName', header: 'Plan', render: (o) => o.planName || <span className="text-slate-400">No plan</span> },
    { key: 'usersCount', header: 'Users', align: 'right', render: (o) => num(o.usersCount) },
    { key: 'subscriptionStatus', header: 'Subscription', render: (o) => <StatusBadge status={o.subscriptionStatus} domain="subscription" /> },
    { key: 'callsThisMonth', header: 'Calls (this month)', align: 'right', render: (o) => num(o.callsThisMonth) },
    { key: 'mrr', header: 'MRR', align: 'right', render: (o) => money(o.mrr) },
    { key: 'createdAt', header: 'Created', render: (o) => dateTime(o.createdAt) },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} domain="organization" /> },
    {
      key: 'actions', header: '', align: 'right', render: (o) => (
        <Dropdown
          trigger={<MoreHorizontal size={16} />}
          triggerClassName="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
          align="end"
          aria-label="Organization actions"
        >
          <DropdownItem icon={Eye} onSelect={() => navigate(`/admin/organizations/${o.id}`)}>View</DropdownItem>
          {canManage && <DropdownItem icon={Pencil} onSelect={() => setEditing(o)}>Edit</DropdownItem>}
          <DropdownItem icon={Eye} onSelect={() => navigate(`/admin/organizations/${o.id}?tab=subscription`)}>View subscription</DropdownItem>
          <DropdownItem icon={Eye} onSelect={() => navigate(`/admin/organizations/${o.id}?tab=billing`)}>View billing</DropdownItem>
          <DropdownItem icon={Eye} onSelect={() => navigate(`/admin/organizations/${o.id}?tab=usage`)}>View usage</DropdownItem>
          <DropdownItem icon={Eye} onSelect={() => navigate(`/admin/organizations/${o.id}?tab=calls`)}>View calls</DropdownItem>
          <DropdownSeparator />
          <Tooltip label="Requires backend token-exchange support — not available yet" wrapperClassName="block w-full">
            <DropdownItem icon={LogIn} disabled onSelect={() => {}}>Login as organization</DropdownItem>
          </Tooltip>
          {canManage && (
            <>
              <DropdownSeparator />
              {o.status === 'suspended' ? (
                <DropdownItem icon={CheckCircle2} onSelect={() => setPending({ org: o, type: 'activate' })}>Activate</DropdownItem>
              ) : (
                <DropdownItem icon={Ban} danger onSelect={() => setPending({ org: o, type: 'suspend' })}>Suspend</DropdownItem>
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
        title="Organizations"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Organizations' }]}
        description="Every tenant on the platform. Organizations are created through self-service sign-up."
      />

      <FilterBar
        search={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder="Search by organization, slug or owner email…"
        filters={[
          { key: 'status', value: status, onChange: resetPage(setStatus), options: STATUS_OPTIONS, placeholder: 'All statuses' },
          ...(planOptions.length ? [{ key: 'plan', value: planId, onChange: resetPage(setPlanId), options: planOptions, placeholder: 'All plans' }] : []),
          { key: 'sort', value: sort, onChange: resetPage(setSort), options: SORT_OPTIONS, placeholder: 'Sort' },
        ]}
      />

      <DataTable
        columns={columns}
        rows={items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle={debouncedSearch || status || planId ? 'No organizations match these filters' : 'No organizations yet'}
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />

      {editing && (
        <EditOrganizationModal org={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }} />
      )}
      <OrgStatusDialog pending={pending} onClose={() => setPending(null)} onDone={() => { setPending(null); list.reload(); }} />
    </div>
  );
}
