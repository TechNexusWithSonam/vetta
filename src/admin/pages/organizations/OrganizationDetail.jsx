import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
import { useAdminAsync } from '../../lib/useAdminAsync.js';
import { SectionHeader, StatusBadge } from '../../components';
import { Tabs, TabsList, TabsTrigger, TabsContent, ErrorState, LoadingState } from '../../../components/ui';
import OverviewTab from './tabs/OverviewTab.jsx';
import UsersTab from './tabs/UsersTab.jsx';
import CallsTab from './tabs/CallsTab.jsx';
import UsageTab from './tabs/UsageTab.jsx';
import SubscriptionTab from './tabs/SubscriptionTab.jsx';
import BillingTab from './tabs/BillingTab.jsx';
import ActivityTab from './tabs/ActivityTab.jsx';

const TABS = [
  { value: 'overview', label: 'Overview', Component: OverviewTab },
  { value: 'users', label: 'Users', Component: UsersTab },
  { value: 'calls', label: 'Calls', Component: CallsTab },
  { value: 'usage', label: 'Usage', Component: UsageTab },
  { value: 'subscription', label: 'Subscription', Component: SubscriptionTab },
  { value: 'billing', label: 'Billing', Component: BillingTab },
  { value: 'activity', label: 'Activity', Component: ActivityTab },
];

export default function OrganizationDetail() {
  const { orgId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const org = useAdminAsync(() => api.admin.organizations.get(orgId), [orgId]);

  const setTab = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', value);
    setSearchParams(next, { replace: true });
  };

  if (org.loading) return <LoadingState label="Loading organization…" />;
  if (org.error) return <ErrorState error={org.error} onRetry={org.reload} />;
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
        actions={<StatusBadge status={data.status} domain="organization" />}
        description={data.ownerEmail}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <t.Component org={data} onOrgChanged={org.reload} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
