import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Pencil, Ban, CheckCircle2, Trash2, LogIn, Plus } from 'lucide-react';
import { api } from '../../../api';
import { useAuth } from '../../../context/useAuth';
import { useAdminAsync } from '../../lib/useAdminAsync.js';
import { logAdminAction } from '../../lib/auditLog.js';
import { SectionHeader, DataTable, FilterBar, StatusBadge } from '../../components';
import { Button, Dropdown, DropdownItem, DropdownSeparator, Tooltip, Modal, ConfirmDialog, Input, Select, useToast } from '../../../components/ui';
import { num, money, dateTime } from '../../../lib/format';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'churned', label: 'Churned' },
];
const PLAN_OPTIONS = ['Starter', 'Growth', 'Business', 'Scale'].map((p) => ({ value: p, label: p }));

function EditOrganizationModal({ org, onClose, onSaved }) {
  const [name, setName] = useState(org.name);
  const [plan, setPlan] = useState(org.plan);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.organizations.update(org.id, { name, plan });
      await logAdminAction({
        action: 'organization.update', entityType: 'organization', entityId: org.id, organizationId: org.id,
        summary: `Updated ${org.name}`, metadata: { name, plan }, actor: user,
      });
      toast.success('Organization updated');
      onSaved();
    } catch (err) {
      toast.error(err?.message || 'Failed to update organization');
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
          <Button onClick={save} loading={saving}>Save changes</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Organization name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Select label="Plan" value={plan} onChange={(e) => setPlan(e.target.value)} options={PLAN_OPTIONS} />
      </div>
    </Modal>
  );
}

export default function OrganizationsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [pending, setPending] = useState(null); // { org, type: 'suspend'|'activate'|'delete' }
  const [actionLoading, setActionLoading] = useState(false);
  const limit = 10;

  const query = useMemo(() => ({ page, limit, search: search || undefined, status: status || undefined, plan: plan || undefined }), [page, search, status, plan]);
  const list = useAdminAsync(() => api.admin.organizations.list(query), [JSON.stringify(query)]);
  const items = list.data?.items || [];
  const total = list.data?.total || 0;

  const ACTION_CONFIG = {
    suspend: {
      title: 'Suspend organization', tone: 'danger', confirmLabel: 'Suspend',
      message: (o) => `${o.name} will lose access immediately. This can be reversed by activating it again.`,
      run: (o) => api.admin.organizations.suspend(o.id, { reason: 'Manual suspension' }),
      action: 'organization.suspend', summary: (o) => `Suspended ${o.name}`, success: 'Organization suspended',
    },
    activate: {
      title: 'Activate organization', tone: 'primary', confirmLabel: 'Activate',
      message: (o) => `${o.name} will regain access immediately.`,
      run: (o) => api.admin.organizations.activate(o.id),
      action: 'organization.activate', summary: (o) => `Activated ${o.name}`, success: 'Organization activated',
    },
    delete: {
      title: 'Delete organization', tone: 'danger', confirmLabel: 'Delete',
      message: (o) => `This permanently deletes ${o.name} and all of its data. This cannot be undone.`,
      run: (o) => api.admin.organizations.remove(o.id),
      action: 'organization.delete', summary: (o) => `Deleted ${o.name}`, success: 'Organization deleted',
    },
  };

  const confirmPending = async () => {
    if (!pending) return;
    const cfg = ACTION_CONFIG[pending.type];
    setActionLoading(true);
    try {
      await cfg.run(pending.org);
      await logAdminAction({
        action: cfg.action, entityType: 'organization', entityId: pending.org.id, organizationId: pending.org.id,
        summary: cfg.summary(pending.org), actor: user,
      });
      toast.success(cfg.success);
      setPending(null);
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Organization', render: (o) => (
      <button onClick={() => navigate(`/admin/organizations/${o.id}`)} className="font-medium text-slate-800 hover:text-brand-700 hover:underline text-left">
        {o.name}
      </button>
    ) },
    { key: 'owner', header: 'Owner', render: (o) => <span className="text-slate-600">{o.ownerEmail}</span> },
    { key: 'plan', header: 'Plan' },
    { key: 'usersCount', header: 'Users', align: 'right', render: (o) => num(o.usersCount) },
    { key: 'subscriptionStatus', header: 'Subscription', render: (o) => <StatusBadge status={o.subscriptionStatus} domain="subscription" /> },
    { key: 'totalCallsThisMonth', header: 'Usage (calls/mo)', align: 'right', render: (o) => num(o.totalCallsThisMonth) },
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
          <DropdownItem icon={Pencil} onSelect={() => setEditing(o)}>Edit</DropdownItem>
          <DropdownItem icon={Eye} onSelect={() => navigate(`/admin/organizations/${o.id}?tab=subscription`)}>View subscription</DropdownItem>
          <DropdownItem icon={Eye} onSelect={() => navigate(`/admin/organizations/${o.id}?tab=billing`)}>View billing</DropdownItem>
          <DropdownItem icon={Eye} onSelect={() => navigate(`/admin/organizations/${o.id}?tab=usage`)}>View usage</DropdownItem>
          <DropdownItem icon={Eye} onSelect={() => navigate(`/admin/organizations/${o.id}?tab=calls`)}>View calls</DropdownItem>
          <DropdownSeparator />
          <Tooltip label="Requires backend token-exchange support — coming soon" wrapperClassName="block w-full">
            <DropdownItem icon={LogIn} disabled onSelect={() => {}}>Login as organization</DropdownItem>
          </Tooltip>
          <DropdownSeparator />
          {o.status === 'suspended' ? (
            <DropdownItem icon={CheckCircle2} onSelect={() => setPending({ org: o, type: 'activate' })}>
              Activate
            </DropdownItem>
          ) : (
            <DropdownItem icon={Ban} danger onSelect={() => setPending({ org: o, type: 'suspend' })}>
              Suspend
            </DropdownItem>
          )}
          <DropdownItem icon={Trash2} danger onSelect={() => setPending({ org: o, type: 'delete' })}>
            Delete
          </DropdownItem>
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Organizations"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Organizations' }]}
        actions={<Button iconLeft={Plus}>New organization</Button>}
      />

      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by organization or owner email…"
        filters={[
          { key: 'status', value: status, onChange: (v) => { setStatus(v); setPage(1); }, options: STATUS_OPTIONS, placeholder: 'All statuses' },
          { key: 'plan', value: plan, onChange: (v) => { setPlan(v); setPage(1); }, options: PLAN_OPTIONS, placeholder: 'All plans' },
        ]}
      />

      <DataTable
        columns={columns}
        rows={items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        isMock={list.isMock}
        emptyTitle="No organizations match these filters"
        page={page}
        total={total}
        pageSize={limit}
        onPageChange={setPage}
      />

      {editing && (
        <EditOrganizationModal
          org={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); list.reload(); }}
        />
      )}

      {pending && (
        <ConfirmDialog
          open
          onClose={() => setActionLoading(false) || setPending(null)}
          onConfirm={confirmPending}
          title={ACTION_CONFIG[pending.type].title}
          message={ACTION_CONFIG[pending.type].message(pending.org)}
          confirmLabel={ACTION_CONFIG[pending.type].confirmLabel}
          tone={ACTION_CONFIG[pending.type].tone}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
