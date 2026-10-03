import { useState } from 'react';
import { api } from '../../../../api';
import { useAdminQuery } from '../../../lib/useAdminQuery.js';
import { friendlyError } from '../../../lib/adminErrors.js';
import { currency, label } from '../../../lib/format.js';
import {
  AssignSubscriptionModal, CancelSubscriptionModal, ChangePlanModal, DataTable, DetailList, StatusBadge,
} from '../../../components';
import { useAdminAccess } from '../../../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../../../rbac/permissions.js';
import { Button, EmptyState, ErrorState } from '../../../../components/ui';
import { dateTime } from '../../../../lib/format';

export default function SubscriptionTab({ org, onOrgChanged }) {
  const { can } = useAdminAccess();
  const canManage = can(P.SUBSCRIPTIONS_MANAGE);
  const [modal, setModal] = useState(null); // 'assign' | 'change' | 'cancel'
  const history = useAdminQuery(
    (signal) => api.admin.subscriptions.list({ organizationId: org.id, limit: 20 }, { signal }),
    [org.id],
  );
  const s = org.subscription;
  const done = () => { setModal(null); history.reload(); onOrgChanged?.(); };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        {!s ? (
          <EmptyState
            title="No live subscription"
            hint="This organization is not on a plan."
            action={canManage ? <Button onClick={() => setModal('assign')}>Assign plan</Button> : null}
          />
        ) : (
          <>
            <DetailList
              columns={3}
              items={[
                { label: 'Plan', value: s.planName },
                { label: 'Status', value: <StatusBadge status={s.status} domain="subscription" /> },
                { label: 'Billing', value: `${currency(s.price, s.currency)} / ${s.billingInterval === 'ANNUAL' ? 'year' : 'month'}` },
                { label: 'MRR', value: currency(s.mrr, s.currency) },
                { label: 'Included minutes', value: s.includedMinutes.toLocaleString() },
                { label: 'Provider', value: s.provider },
                { label: 'Started', value: dateTime(s.startedAt) },
                { label: 'Current period', value: `${dateTime(s.currentPeriodStart)} – ${dateTime(s.currentPeriodEnd)}` },
                { label: 'Trial ends', value: dateTime(s.trialEndsAt) },
                { label: 'Cancellation', value: s.cancelAtPeriodEnd ? 'Scheduled at period end' : null },
                { label: 'Last payment', value: s.lastPayment ? `${currency(s.lastPayment.amount, s.currency)} · ${label(s.lastPayment.status)}` : 'None recorded' },
              ]}
            />
            {canManage && (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setModal('change')}>Change plan</Button>
                {!s.cancelAtPeriodEnd && <Button variant="danger" onClick={() => setModal('cancel')}>Cancel subscription</Button>}
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Subscription history</h3>
        {history.error ? (
          <ErrorState error={friendlyError(history.error)} onRetry={history.reload} />
        ) : (
          <DataTable
            columns={[
              { key: 'planName', header: 'Plan' },
              { key: 'billingInterval', header: 'Interval', render: (r) => label(r.billingInterval) },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} domain="subscription" /> },
              { key: 'startedAt', header: 'Started', render: (r) => dateTime(r.startedAt) },
              { key: 'cancelledAt', header: 'Cancelled', render: (r) => dateTime(r.cancelledAt) || '—' },
            ]}
            rows={history.data?.data || []}
            loading={history.loading}
            emptyTitle="No subscriptions yet"
          />
        )}
      </div>

      {modal === 'assign' && <AssignSubscriptionModal organization={org} onClose={() => setModal(null)} onSaved={done} />}
      {modal === 'change' && s && <ChangePlanModal subscription={s} onClose={() => setModal(null)} onSaved={done} />}
      {modal === 'cancel' && s && <CancelSubscriptionModal subscription={s} onClose={() => setModal(null)} onSaved={done} />}
    </div>
  );
}
