import { DemoDataBadge } from './DemoDataBadge.jsx';

/**
 * KPI tile — generalizes the inline `KpiCard` pattern from `pages/Dashboard.jsx`
 * so every admin module shares one stat-tile implementation.
 */
export function StatCard({ label, value, icon, iconWrap = 'bg-brand-50', iconColor = 'text-brand-600', hint, loading, isMock }) {
  const Icon = icon;
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          {loading ? (
            <div className="h-9 w-28 rounded bg-slate-100 animate-pulse" />
          ) : (
            <h2 className="text-3xl font-bold text-slate-900 truncate">{value}</h2>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${iconWrap}`}>
            <Icon className={iconColor} size={24} />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-400 truncate">
        {loading ? (
          <span className="inline-block h-4 w-32 rounded bg-slate-100 animate-pulse" />
        ) : (
          <>
            <span className="truncate">{hint}</span>
            {isMock && <DemoDataBadge className="shrink-0" />}
          </>
        )}
      </div>
    </div>
  );
}

export default StatCard;
