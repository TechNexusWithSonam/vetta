import { ErrorState } from '../../components/ui';
import { friendlyError } from '../lib/adminErrors.js';

/** Card chrome around a caller-supplied recharts chart — matches Dashboard.jsx's card styling. Chart usage itself stays inline per page. */
export function ChartCard({ title, actions, loading, error, onRetry, empty, emptyText = 'No data for this period yet.', height = 320, children, className = '' }) {
  return (
    <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-lg font-semibold text-slate-800 truncate">{title}</h3>
        </div>
        {actions}
      </div>
      <div style={{ height }} className="w-full">
        {loading ? (
          <div className="h-full w-full rounded-lg bg-slate-50 animate-pulse" />
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <ErrorState error={friendlyError(error)} onRetry={onRetry} />
          </div>
        ) : empty ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">{emptyText}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default ChartCard;
