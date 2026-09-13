import { useState } from 'react';
import { api } from '../../api';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { SectionHeader, DataTable, FilterBar } from '../components';
import { dateTime } from '../../lib/format';

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const query = { page, limit, actorEmail: search || undefined, action: action || undefined };
  const list = useAdminAsync(() => api.admin.auditLogs.list(query), [JSON.stringify(query)]);
  const items = list.data?.items || [];
  const actionOptions = [...new Set(items.map((i) => i.action))].map((a) => ({ value: a, label: a.replace(/[._]/g, ' ') }));

  const columns = [
    { key: 'at', header: 'When', render: (a) => dateTime(a.at) },
    { key: 'actorEmail', header: 'Actor' },
    { key: 'action', header: 'Action', render: (a) => a.action.replace(/[._]/g, ' ') },
    { key: 'entityType', header: 'Entity' },
    { key: 'organizationId', header: 'Organization' },
    { key: 'summary', header: 'Summary' },
  ];

  return (
    <div>
      <SectionHeader
        title="Audit Logs"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Audit Logs' }]}
        description="Every role change, pricing change, subscription change, suspension, refund, and permission change performed from this panel."
      />
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Filter by actor email…"
        filters={[{ key: 'action', value: action, onChange: (v) => { setAction(v); setPage(1); }, options: actionOptions, placeholder: 'All actions' }]}
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        isMock={list.isMock}
        emptyTitle="No audit log entries match these filters"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
    </div>
  );
}
