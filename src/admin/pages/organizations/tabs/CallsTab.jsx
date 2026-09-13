import { useState } from 'react';
import { api } from '../../../../api';
import { useAdminAsync } from '../../../lib/useAdminAsync.js';
import { DataTable, StatusBadge } from '../../../components';
import { duration, money, relativeTime } from '../../../../lib/format';

export default function CallsTab({ org }) {
  const [page, setPage] = useState(1);
  const limit = 10;
  const list = useAdminAsync(() => api.admin.organizations.callsOf(org.id, { page, limit }), [org.id, page]);
  const items = list.data?.items || [];

  const columns = [
    { key: 'toPhoneNumber', header: 'Number' },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} domain="call" /> },
    { key: 'durationSeconds', header: 'Duration', render: (c) => duration(c.durationSeconds) },
    { key: 'costUsd', header: 'Cost', align: 'right', render: (c) => money(c.costUsd) },
    { key: 'provider', header: 'Provider' },
    { key: 'createdAt', header: 'When', render: (c) => relativeTime(c.createdAt) },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      loading={list.loading}
      error={list.error}
      onRetry={list.reload}
      isMock={list.isMock}
      emptyTitle="No calls for this organization"
      page={page}
      total={list.data?.total || 0}
      pageSize={limit}
      onPageChange={setPage}
    />
  );
}
