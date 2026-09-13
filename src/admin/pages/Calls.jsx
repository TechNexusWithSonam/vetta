import { useMemo, useState } from 'react';
import { api } from '../../api';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { SectionHeader, DataTable, FilterBar, StatusBadge } from '../components';
import { CALL_STATUSES } from '../mocks/calls.mock.js';
import { duration, money, relativeTime } from '../../lib/format';

const STATUS_OPTIONS = CALL_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }));

export default function AdminCalls() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  const query = useMemo(() => ({ page, limit, status: status || undefined }), [page, status]);
  const list = useAdminAsync(() => api.admin.calls.list(query), [JSON.stringify(query)]);
  const items = list.data?.items || [];

  const columns = [
    { key: 'organizationName', header: 'Organization' },
    { key: 'toPhoneNumber', header: 'Number' },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} domain="call" /> },
    { key: 'durationSeconds', header: 'Duration', render: (c) => duration(c.durationSeconds) },
    { key: 'costUsd', header: 'Cost', align: 'right', render: (c) => money(c.costUsd) },
    { key: 'provider', header: 'Provider' },
    { key: 'createdAt', header: 'When', render: (c) => relativeTime(c.createdAt) },
  ];

  return (
    <div>
      <SectionHeader title="Calls" breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Calls' }]} description="Platform-wide call activity across every organization." />
      <FilterBar
        filters={[{ key: 'status', value: status, onChange: (v) => { setStatus(v); setPage(1); }, options: STATUS_OPTIONS, placeholder: 'All statuses' }]}
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        isMock={list.isMock}
        emptyTitle="No calls match these filters"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
    </div>
  );
}
