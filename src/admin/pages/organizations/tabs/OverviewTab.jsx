import { Building2, Users, DollarSign, Gauge } from 'lucide-react';
import { StatCard, DetailList, StatusBadge } from '../../../components';
import { num, money, dateTime } from '../../../../lib/format';

export default function OverviewTab({ org }) {
  const credits = org.credits;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Plan" value={org.planName || 'No plan'} icon={Building2} iconWrap="bg-indigo-50" iconColor="text-indigo-600"
          hint={org.subscriptionStatus ? `Subscription ${org.subscriptionStatus.toLowerCase().replace('_', ' ')}` : 'No live subscription'} />
        <StatCard label="Users" value={num(org.usersCount)} icon={Users} iconWrap="bg-blue-50" iconColor="text-blue-600"
          hint="Members in this organization" />
        <StatCard label="MRR" value={money(org.mrr)} icon={DollarSign} iconWrap="bg-emerald-50" iconColor="text-emerald-600"
          hint={org.renewsAt ? `Renews ${dateTime(org.renewsAt)}` : 'Not billed'} />
        <StatCard label="Credits Remaining" value={num(credits?.remaining)} icon={Gauge} iconWrap="bg-orange-50" iconColor="text-orange-600"
          hint={credits ? `${num(credits.used)} of ${num(credits.limit)} minutes used${credits.highUsage ? ' · High usage' : ''}` : '—'} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Organization details</h3>
        <DetailList
          items={[
            { label: 'Owner', value: org.owner?.name },
            { label: 'Owner email', value: org.ownerEmail },
            { label: 'Slug', value: org.slug },
            { label: 'Status', value: <StatusBadge status={org.status} domain="organization" /> },
            { label: 'Created', value: dateTime(org.createdAt) },
            { label: 'Last updated', value: dateTime(org.updatedAt) },
            { label: 'Leads', value: num(org.leadsCount) },
            { label: 'Campaigns', value: num(org.campaignsCount) },
            { label: 'Calls this month', value: num(org.callsThisMonth) },
            { label: 'Calls all time', value: num(org.totalCalls) },
          ]}
        />
      </div>
    </div>
  );
}
