import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
import { useAdminQuery } from '../../lib/useAdminQuery.js';
import { friendlyError } from '../../lib/adminErrors.js';
import { SectionHeader, StatusBadge } from '../../components';
import { useAdminAccess } from '../../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../../rbac/permissions.js';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, ErrorState, LoadingState } from '../../../components/ui';
import { OrgStatusDialog } from './OrganizationsList.jsx';
import OverviewTab from './tabs/OverviewTab.jsx';
import UsersTab from './tabs/UsersTab.jsx';
import CallsTab from './tabs/CallsTab.jsx';
import UsageTab from './tabs/UsageTab.jsx';
import SubscriptionTab from './tabs/SubscriptionTab.jsx';
import BillingTab from './tabs/BillingTab.jsx';
import ActivityTab from './tabs/ActivityTab.jsx';

/** Tabs are shown only when the operator can read the underlying data. */
const TABS = [
  { value: 'overview', label: 'Overview', Component: OverviewTab },
  { value: 'users', label: 'Users', Component: UsersTab, permission: P.USERS_VIEW },
  { value: 'calls', label: 'Calls', Component: CallsTab, permission: P.CALLS_VIEW },
  { value: 'usage', label: 'Usage', Component: UsageTab, permission: P.USAGE_VIEW },
  { value: 'subscription', label: 'Subscription', Component: SubscriptionTab, permission: P.SUBSCRIPTIONS_VIEW },
  { value: 'billing', label: 'Billing', Component: BillingTab, permission: P.BILLING_VIEW },
  { value: 'activity', label: 'Activity', Component: ActivityTab, permission: P.AUDIT_LOGS_VIEW },
];

export default function OrganizationDetail() {
  const { orgId } = useParams();
  const { can } = useAdminAccess();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pending, setPending] = useState(null);
  const tabs = TABS.filter((t) => !t.permission || can(t.permission));
  const requested = searchParams.get('tab') || 'overview';
  const tab = tabs.some((t) => t.value === requested) ? requested : 'overview';

  const org = useAdminQuery((signal) => api.admin.organizations.get(orgId, { signal }), [orgId]);

  const setTab = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', value);
    setSearchParams(next, { replace: true });
  };

  if (org.loading) return <LoadingState label="Loading organization…" />;
  if (org.error) return <ErrorState error={friendlyError(org.error)} onRetry={org.reload} />;
  const data = org.data;

  return (
    <div>
      <SectionHeader
        title={data.name}
        breadcrumbItems={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Organizations', to: '/admin/organizations' },
          { label: data.name },
        ]}
        actions={
          <>
            <StatusBadge status={data.status} domain="organization" />
            {can(P.ORGANIZATIONS_MANAGE) && (
              data.status === 'suspended' ? (
                <Button size="sm" variant="secondary" onClick={() => setPending({ org: data, type: 'activate' })}>Activate</Button>
              ) : (
                <Button size="sm" variant="danger" onClick={() => setPending({ org: data, type: 'suspend' })}>Suspend</Button>
              )
            )}
          </>
        }
        description={data.ownerEmail || data.slug}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {tab === t.value && <t.Component org={data} onOrgChanged={org.reload} />}
          </TabsContent>
        ))}
      </Tabs>

      <OrgStatusDialog pending={pending} onClose={() => setPending(null)} onDone={() => { setPending(null); org.reload(); }} />
    </div>
  );
}
