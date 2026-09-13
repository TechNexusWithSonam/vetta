import { useState } from 'react';
import { api } from '../../../../api';
import { useAdminAsync } from '../../../lib/useAdminAsync.js';
import { DataTable, StatusBadge } from '../../../components';
import { relativeTime, dateTime } from '../../../../lib/format';

export default function UsersTab({ org }) {
  const [page, setPage] = useState(1);
  const limit = 10;
  const list = useAdminAsync(() => api.admin.organizations.usersOf(org.id, { page, limit }), [org.id, page]);
  const items = list.data?.items || [];

  const columns = [
    { key: 'name', header: 'Name', render: (u) => `${u.firstName} ${u.lastName}` },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} domain="user" /> },
    { key: 'lastActiveAt', header: 'Last active', render: (u) => relativeTime(u.lastActiveAt) },
    { key: 'createdAt', header: 'Created', render: (u) => dateTime(u.createdAt) },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      loading={list.loading}
      error={list.error}
      onRetry={list.reload}
      isMock={list.isMock}
      emptyTitle="No users in this organization"
      page={page}
      total={list.data?.total || 0}
      pageSize={limit}
      onPageChange={setPage}
    />
  );
}
