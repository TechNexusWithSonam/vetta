import { useState } from 'react';
import { api } from '../../../../api';
import { useAdminAsync } from '../../../lib/useAdminAsync.js';
import { DataTable } from '../../../components';
import { dateTime } from '../../../../lib/format';

export default function ActivityTab({ org }) {
  const [page, setPage] = useState(1);
  const limit = 10;
  const list = useAdminAsync(() => api.admin.organizations.activityOf(org.id, { page, limit }), [org.id, page]);
  const items = list.data?.items || [];

  const columns = [
    { key: 'at', header: 'When', render: (a) => dateTime(a.at) },
    { key: 'action', header: 'Action' },
    { key: 'actorEmail', header: 'Actor' },
    { key: 'summary', header: 'Summary' },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      loading={list.loading}
      error={list.error}
      onRetry={list.reload}
      isMock={list.isMock}
      emptyTitle="No recorded activity for this organization"
      page={page}
      total={list.data?.total || 0}
      pageSize={limit}
      onPageChange={setPage}
    />
  );
}
