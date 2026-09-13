import { Building2, Users, DollarSign, Gauge } from 'lucide-react';
import { StatCard } from '../../../components';
import { num, money, dateTime } from '../../../../lib/format';

export default function OverviewTab({ org }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Plan" value={org.plan} icon={Building2} iconWrap="bg-indigo-50" iconColor="text-indigo-600" hint={`Created ${dateTime(org.createdAt)}`} />
        <StatCard label="Users" value={num(org.usersCount)} icon={Users} iconWrap="bg-blue-50" iconColor="text-blue-600" hint="Seats in use" />
        <StatCard label="MRR" value={money(org.mrr)} icon={DollarSign} iconWrap="bg-emerald-50" iconColor="text-emerald-600" hint={`Renews ${dateTime(org.renewsAt)}`} />
        <StatCard label="Credits Remaining" value={num(org.creditsRemaining)} icon={Gauge} iconWrap="bg-orange-50" iconColor="text-orange-600" hint={org.creditsRemaining < 500 ? 'Low credits' : 'Healthy'} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Organization details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-400">Owner</dt><dd className="text-slate-800 font-medium">{org.ownerName}</dd></div>
          <div><dt className="text-slate-400">Owner email</dt><dd className="text-slate-800 font-medium">{org.ownerEmail}</dd></div>
          <div><dt className="text-slate-400">Domain</dt><dd className="text-slate-800 font-medium">{org.domain}</dd></div>
          <div><dt className="text-slate-400">Calls this month</dt><dd className="text-slate-800 font-medium">{num(org.totalCallsThisMonth)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
