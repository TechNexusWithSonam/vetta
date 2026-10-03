import { useState } from 'react';
import { api } from '../../../../api';
import { useAdminQuery } from '../../../lib/useAdminQuery.js';
import { fullName } from '../../../lib/format.js';
import { DataTable, StatusBadge } from '../../../components';
import { relativeTime, dateTime } from '../../../../lib/format';

export default function UsersTab({ org }) {
  const [page, setPage] = useState(1);
  const limit = 10;
  const list = useAdminQuery(
    (signal) => api.admin.users.list({ organizationId: org.id, page, limit }, { signal }),
    [org.id, page],
  );

  const columns = [
    { key: 'name', header: 'Name', render: (u) => fullName(u) },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} domain="user" /> },
    { key: 'lastActiveAt', header: 'Last active', render: (u) => relativeTime(u.lastActiveAt) || 'Never' },
    { key: 'createdAt', header: 'Created', render: (u) => dateTime(u.createdAt) },
  ];

  return (
    <DataTable
      columns={columns}
      rows={list.data?.data || []}
      loading={list.loading}
      error={list.error}
      onRetry={list.reload}
      emptyTitle="No users in this organization"
      page={page}
      total={list.data?.total || 0}
      pageSize={limit}
      onPageChange={setPage}
    />
  );
}
