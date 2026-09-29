import { useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../../../api';
import { useAdminQuery } from '../../../lib/useAdminQuery.js';
import { currency, shortId } from '../../../lib/format.js';
import { DataTable, PaymentDetailModal, RecordPaymentModal, RefundPaymentModal, StatusBadge } from '../../../components';
import { useAdminAccess } from '../../../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../../../rbac/permissions.js';
import { Button } from '../../../../components/ui';
import { dateTime } from '../../../../lib/format';

export default function BillingTab({ org }) {
  const { can } = useAdminAccess();
  const canManage = can(P.BILLING_MANAGE);
  const [page, setPage] = useState(1);
  const [recording, setRecording] = useState(false);
  const [refunding, setRefunding] = useState(null);
  const [openId, setOpenId] = useState(null);
  const limit = 10;
  const list = useAdminQuery(
    (signal) => api.admin.billing.payments.list({ organizationId: org.id, page, limit }, { signal }),
    [org.id, page],
  );

  const columns = [
    { key: 'id', header: 'Payment', render: (p) => <code className="text-xs">{shortId(p.id)}</code> },
    { key: 'amount', header: 'Amount', align: 'right', render: (p) => currency(p.amount, p.currency) },
    { key: 'refundedAmount', header: 'Refunded', align: 'right', render: (p) => (p.refundedAmount ? currency(p.refundedAmount, p.currency) : '—') },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} domain="payment" /> },
    { key: 'provider', header: 'Provider' },
    { key: 'paidAt', header: 'Paid', render: (p) => dateTime(p.paidAt) || '—' },
    {
      key: 'actions', header: '', align: 'right', render: (p) => (
        canManage && p.provider === 'MANUAL' && p.status === 'SUCCEEDED' && (
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setRefunding(p); }}>Refund</Button>
        )
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button iconLeft={Plus} onClick={() => setRecording(true)}>Record payment</Button>
        </div>
      )}
      <DataTable
        columns={columns}
        rows={list.data?.data || []}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        onRowClick={(p) => setOpenId(p.id)}
        emptyTitle="No payments recorded for this organization"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
      {recording && (
        <RecordPaymentModal organization={org} onClose={() => setRecording(false)} onSaved={() => { setRecording(false); list.reload(); }} />
      )}
      {refunding && (
        <RefundPaymentModal payment={refunding} onClose={() => setRefunding(null)} onSaved={() => { setRefunding(null); list.reload(); }} />
      )}
      {openId && <PaymentDetailModal paymentId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
