import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { useDebounced } from '../lib/useDebounced.js';
import { friendlyError } from '../lib/adminErrors.js';
import { cleanParams, label } from '../lib/format.js';
import { SectionHeader, DataTable, FilterBar, StatusBadge, DetailList } from '../components';
import { ErrorState, Input, LoadingState, Modal } from '../../components/ui';
import { dateTime } from '../../lib/format';

// Mirrors the backend AuditAction enum.
const ACTION_OPTIONS = ['CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'STATUS_CHANGE'].map((a) => ({ value: a, label: label(a) }));
const SCOPE_OPTIONS = [
  { value: 'platform', label: 'Admin panel actions' },
  { value: 'tenant', label: 'Tenant activity' },
];

function JsonBlock({ value }) {
  if (value === null || value === undefined) return <p className="text-sm text-slate-400">—</p>;
  return (
    <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(value, null, 2)}</pre>
  );
}

/** Read-only detail of one audit entry, including the recorded before/after state. */
export function AuditDetailModal({ id, onClose }) {
  const q = useAdminQuery((signal) => api.admin.auditLogs.get(id, { signal }), [id]);
  const a = q.data;
  return (
    <Modal open onClose={onClose} title="Audit log entry" size="xl">
      {q.loading ? <LoadingState label="Loading entry…" /> : q.error ? <ErrorState error={friendlyError(q.error)} onRetry={q.reload} /> : (
        <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
          <DetailList
            items={[
              { label: 'When', value: dateTime(a.at) },
              { label: 'Actor', value: a.actorEmail },
              { label: 'Action', value: label(a.action) },
              { label: 'Module', value: a.entityType },
              { label: 'Organization', value: a.organizationName || 'Platform-level' },
              { label: 'Source', value: <StatusBadge status={a.scope} domain="audit" size="sm" /> },
              { label: 'Entity ID', value: <code className="text-xs">{a.entityId}</code> },
              { label: 'Summary', value: a.summary },
            ]}
          />
          <div>
            <h4 className="mb-1 text-sm font-semibold text-slate-800">Before</h4>
            <JsonBlock value={a.before} />
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold text-slate-800">After</h4>
            <JsonBlock value={a.after} />
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AdminAuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') || '';
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [scope, setScope] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const limit = 15;
  const debouncedSearch = useDebounced(search);
  const badRange = from && to && from > to;

  const entityTypes = useAdminQuery((signal) => api.admin.auditLogs.entityTypes({ signal }), []);
  const query = useMemo(
    () => cleanParams({ page, limit, search: debouncedSearch.trim(), action, entityType, scope, from, to, organizationId }),
    [page, debouncedSearch, action, entityType, scope, from, to, organizationId],
  );
  const list = useAdminQuery(
    (signal) => (badRange ? Promise.resolve({ data: [], total: 0 }) : api.admin.auditLogs.list(query, { signal })),
    [query, badRange],
  );
  const resetPage = (fn) => (v) => { fn(v); setPage(1); };
  const filtered = debouncedSearch || action || entityType || scope || from || to || organizationId;

  const columns = [
    { key: 'at', header: 'When', render: (a) => dateTime(a.at) },
    { key: 'actorEmail', header: 'Actor' },
    { key: 'action', header: 'Action', render: (a) => label(a.action) },
    { key: 'entityType', header: 'Module' },
    { key: 'organizationName', header: 'Organization', render: (a) => a.organizationName || <span className="text-slate-400">Platform</span> },
    { key: 'scope', header: 'Source', render: (a) => <StatusBadge status={a.scope} domain="audit" size="sm" /> },
    { key: 'summary', header: 'Summary', className: 'max-w-md truncate' },
  ];

  return (
    <div>
      <SectionHeader
        title="Audit Logs"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Audit Logs' }]}
        description="Immutable record of admin-panel actions and tenant activity. Entries are written by the server and cannot be edited or deleted."
      />
      <FilterBar
        search={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder="Filter by actor email…"
        filters={[
          { key: 'action', value: action, onChange: resetPage(setAction), options: ACTION_OPTIONS, placeholder: 'All actions' },
          { key: 'entityType', value: entityType, onChange: resetPage(setEntityType), options: (entityTypes.data || []).map((t) => ({ value: t, label: t })), placeholder: 'All modules' },
          { key: 'scope', value: scope, onChange: resetPage(setScope), options: SCOPE_OPTIONS, placeholder: 'All sources' },
        ]}
        actions={
          <div className="flex items-end gap-2">
            <Input type="date" aria-label="From date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            <Input type="date" aria-label="To date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
        }
      />
      {badRange && <p className="-mt-2 mb-3 text-sm text-rose-600">“From” must be on or before “To”.</p>}
      {organizationId && (
        <p className="-mt-2 mb-3 text-sm text-slate-600">
          Showing one organization only.{' '}
          <button className="font-medium text-brand-600 hover:underline" onClick={() => { setSearchParams({}); setPage(1); }}>Show all</button>
        </p>
      )}
      <DataTable
        columns={columns}
        rows={list.data?.data || []}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        onRowClick={(a) => setOpenId(a.id)}
        emptyTitle={filtered ? 'No audit log entries match these filters' : 'No audit log entries yet'}
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
      {openId && <AuditDetailModal id={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
