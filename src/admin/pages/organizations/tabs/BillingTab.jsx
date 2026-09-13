import { useState } from 'react';
import { api } from '../../../../api';
import { useAuth } from '../../../../context/useAuth';
import { useAdminAsync } from '../../../lib/useAdminAsync.js';
import { logAdminAction } from '../../../lib/auditLog.js';
import { DataTable, StatusBadge } from '../../../components';
import { Button, ConfirmDialog, useToast } from '../../../../components/ui';
import { money, dateTime } from '../../../../lib/format';

export default function BillingTab({ org }) {
  const [page, setPage] = useState(1);
  const [refunding, setRefunding] = useState(null);
  const [saving, setSaving] = useState(false);
  const limit = 10;
  const list = useAdminAsync(() => api.admin.organizations.billingOf(org.id, { page, limit }), [org.id, page]);
  const items = list.data?.items || [];
  const toast = useToast();
  const { user } = useAuth();

  const refund = async () => {
    setSaving(true);
    try {
      await api.admin.billing.invoices.refund(refunding.id, { amount: refunding.amount, reason: 'Refunded by admin' });
      await logAdminAction({
        action: 'billing.refund', entityType: 'invoice', entityId: refunding.id, organizationId: org.id,
        summary: `Refunded invoice ${refunding.id} for ${org.name}`, metadata: { amount: refunding.amount }, actor: user,
      });
      toast.success('Invoice refunded');
      setRefunding(null);
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to refund invoice');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'id', header: 'Invoice' },
    { key: 'amount', header: 'Amount', align: 'right', render: (i) => money(i.amount) },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} domain="invoice" /> },
    { key: 'issuedAt', header: 'Issued', render: (i) => dateTime(i.issuedAt) },
    {
      key: 'actions', header: '', align: 'right', render: (i) => (
        i.status === 'paid' && <Button size="sm" variant="secondary" onClick={() => setRefunding(i)}>Refund</Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        isMock={list.isMock}
        emptyTitle="No invoices for this organization"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
      <ConfirmDialog
        open={!!refunding}
        onClose={() => setRefunding(null)}
        onConfirm={refund}
        title="Refund invoice"
        message={refunding ? `Refund ${money(refunding.amount)} for invoice ${refunding.id}?` : ''}
        confirmLabel="Refund"
        tone="danger"
        loading={saving}
      />
    </>
  );
}
