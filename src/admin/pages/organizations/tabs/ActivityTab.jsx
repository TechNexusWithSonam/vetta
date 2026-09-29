import { useState } from 'react';
import { api } from '../../../../api';
import { useAdminQuery } from '../../../lib/useAdminQuery.js';
import { label } from '../../../lib/format.js';
import { DataTable, StatusBadge } from '../../../components';
import { AuditDetailModal } from '../../AuditLogs.jsx';
import { dateTime } from '../../../../lib/format';

export default function ActivityTab({ org }) {
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const limit = 10;
  const list = useAdminQuery(
    (signal) => api.admin.auditLogs.list({ organizationId: org.id, page, limit }, { signal }),
    [org.id, page],
  );

  const columns = [
    { key: 'at', header: 'When', render: (a) => dateTime(a.at) },
    { key: 'action', header: 'Action', render: (a) => label(a.action) },
    { key: 'entityType', header: 'Module' },
    { key: 'actorEmail', header: 'Actor' },
    { key: 'scope', header: 'Source', render: (a) => <StatusBadge status={a.scope} domain="audit" size="sm" /> },
    { key: 'summary', header: 'Summary' },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={list.data?.data || []}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        onRowClick={(a) => setOpenId(a.id)}
        emptyTitle="No recorded activity for this organization"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
      {openId && <AuditDetailModal id={openId} onClose={() => setOpenId(null)} />}
    </>
  );
}
