/** Small shared presentational bits for the API-wired pages. */

import React from 'react';
import { AlertCircle, RefreshCcw, Inbox } from 'lucide-react';

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-100 ${className}`} />;
}

export function ErrorState({ error, onRetry, compact = false }) {
  const message = error?.message || 'Something went wrong loading this data.';
  return (
    <div
      className={`flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-700 ${
        compact ? 'px-3 py-2' : 'px-4 py-3'
      }`}
    >
      <span className="flex items-center space-x-2 min-w-0">
        <AlertCircle size={16} className="shrink-0" />
        <span className="truncate">{message}</span>
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 flex items-center space-x-1.5 rounded-md border border-rose-300 bg-white px-2.5 py-1 font-medium text-rose-700 hover:bg-rose-100 transition-colors shrink-0"
        >
          <RefreshCcw size={13} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = Inbox, title = 'Nothing here yet', hint }) {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 text-slate-400">
      <Icon size={32} className="mb-3 text-slate-300" />
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {hint && <p className="text-xs mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}
