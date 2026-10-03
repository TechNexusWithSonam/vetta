import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api } from '../../api';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { useDebounced } from '../lib/useDebounced.js';
import { cleanParams, currency, label } from '../lib/format.js';
import {
  SectionHeader, DataTable, FilterBar, StatusBadge, AssignSubscriptionModal, ChangePlanModal, CancelSubscriptionModal,
} from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import { Button } from '../../components/ui';
import { dateTime } from '../../lib/format';

const STATUS_OPTIONS = ['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'].map((s) => ({ value: s, label: label(s) }));

export default function AdminSubscriptions() {
  const { can } = useAdminAccess();
  const canManage = can(P.SUBSCRIPTIONS_MANAGE);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [planId, setPlanId] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type, row? }
  const limit = 10;
  const debouncedSearch = useDebounced(search);

  const plans = useAdminQuery((signal) => (can(P.PLANS_VIEW) ? api.admin.plans.list({ signal }) : Promise.resolve([])), []);
  const query = useMemo(
    () => cleanParams({ page, limit, search: debouncedSearch.trim(), status, planId }),
    [page, debouncedSearch, status, planId],
  );
  const list = useAdminQuery((signal) => api.admin.subscriptions.list(query, { signal }), [query]);
  const resetPage = (fn) => (v) => { fn(v); setPage(1); };
  const done = () => { setModal(null); list.reload(); };

  const columns = [
    { key: 'organizationName', header: 'Organization', render: (s) => (
      <Link to={`/admin/organizations/${s.organizationId}?tab=subscription`} className="font-medium text-slate-800 hover:text-brand-700 hover:underline">
        {s.organizationName}
      </Link>
    ) },
    { key: 'planName', header: 'Plan' },
    { key: 'billingInterval', header: 'Billing', render: (s) => `${currency(s.price, s.currency)} / ${s.billingInterval === 'ANNUAL' ? 'yr' : 'mo'}` },
    { key: 'mrr', header: 'MRR', align: 'right', render: (s) => currency(s.mrr, s.currency) },
    { key: 'startedAt', header: 'Started', render: (s) => dateTime(s.startedAt) },
    { key: 'currentPeriodEnd', header: 'Period ends', render: (s) => (
      <span>{dateTime(s.currentPeriodEnd)}{s.cancelAtPeriodEnd && <span className="block text-xs text-amber-600">Cancels at period end</span>}</span>
    ) },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} domain="subscription" /> },
    { key: 'lastPayment', header: 'Last payment', render: (s) => (s.lastPayment ? `${currency(s.lastPayment.amount, s.currency)} · ${label(s.lastPayment.status)}` : '—') },
    {
      key: 'actions', header: '', align: 'right', render: (s) => (
        canManage && ['TRIALING', 'ACTIVE', 'PAST_DUE'].includes(s.status) && (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setModal({ type: 'change', row: s })}>Change plan</Button>
            {!s.cancelAtPeriodEnd && <Button size="sm" variant="danger" onClick={() => setModal({ type: 'cancel', row: s })}>Cancel</Button>}
          </div>
        )
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Subscriptions"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Subscriptions' }]}
        description="Plan subscriptions across all organizations. At most one live subscription per organization."
        actions={canManage && <Button iconLeft={Plus} onClick={() => setModal({ type: 'assign' })}>Assign plan</Button>}
      />
      <FilterBar
        search={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder="Search by organization…"
        filters={[
          { key: 'status', value: status, onChange: resetPage(setStatus), options: STATUS_OPTIONS, placeholder: 'All statuses' },
          ...((plans.data || []).length
            ? [{ key: 'plan', value: planId, onChange: resetPage(setPlanId), options: plans.data.map((p) => ({ value: p.id, label: p.name })), placeholder: 'All plans' }]
            : []),
        ]}
      />
      <DataTable
        columns={columns}
        rows={list.data?.data || []}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle={debouncedSearch || status || planId ? 'No subscriptions match these filters' : 'No subscriptions yet'}
        emptyHint={!debouncedSearch && !status && !planId && canManage ? 'Use “Assign plan” to put an organization on a plan.' : undefined}
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
      {modal?.type === 'assign' && <AssignSubscriptionModal onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'change' && <ChangePlanModal subscription={modal.row} onClose={() => setModal(null)} onSaved={done} />}
      {modal?.type === 'cancel' && <CancelSubscriptionModal subscription={modal.row} onClose={() => setModal(null)} onSaved={done} />}
    </div>
  );
}
