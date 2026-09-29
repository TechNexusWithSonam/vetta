import { useState } from 'react';
import { api } from '../../../../api';
import { useAdminQuery } from '../../../lib/useAdminQuery.js';
import { currency, label } from '../../../lib/format.js';
import { CallDetailModal, DataTable, StatusBadge } from '../../../components';
import { duration, relativeTime } from '../../../../lib/format';

export default function CallsTab({ org }) {
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const limit = 10;
  const list = useAdminQuery(
    (signal) => api.admin.calls.list({ organizationId: org.id, page, limit }, { signal }),
    [org.id, page],
  );

  const columns = [
    { key: 'leadName', header: 'Lead', render: (c) => c.leadName || '—' },
    { key: 'toPhoneNumber', header: 'Number' },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} domain="call" /> },
    { key: 'outcome', header: 'Outcome', render: (c) => label(c.outcome) },
    { key: 'durationSeconds', header: 'Duration', render: (c) => duration(c.durationSeconds) },
    { key: 'costUsd', header: 'Cost', align: 'right', render: (c) => (c.costUsd === null ? '—' : currency(c.costUsd)) },
    { key: 'provider', header: 'Provider' },
    { key: 'createdAt', header: 'When', render: (c) => relativeTime(c.createdAt) },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={list.data?.data || []}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        onRowClick={(c) => setOpenId(c.id)}
        emptyTitle="No calls for this organization"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
      {openId && <CallDetailModal callId={openId} onClose={() => setOpenId(null)} />}
    </>
  );
}
