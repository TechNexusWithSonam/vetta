/**
 * ErrorState / EmptyState — carried over from the original `components/ui.jsx`
 * with the same props so existing pages are unaffected. Both gain a couple of
 * optional extras (`title` on ErrorState, `action` on EmptyState).
 */

import React from 'react';
import { AlertCircle, RefreshCcw, Inbox } from 'lucide-react';
import { cn } from './cn.js';

export function ErrorState({ error, onRetry, compact = false, title, className = '' }) {
  const message = error?.message || 'Something went wrong loading this data.';
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-700',
        compact ? 'px-3 py-2' : 'px-4 py-3',
        className,
      )}
      role="alert"
    >
      <span className="flex min-w-0 items-center space-x-2">
        <AlertCircle size={16} className="shrink-0" />
        <span className="min-w-0">
          {title && <span className="font-semibold">{title}: </span>}
          <span className={compact ? 'truncate' : ''}>{message}</span>
        </span>
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 flex shrink-0 items-center space-x-1.5 rounded-md border border-rose-300 bg-white px-2.5 py-1 font-medium text-rose-700 transition-colors hover:bg-rose-100"
        >
          <RefreshCcw size={13} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = Inbox, title = 'Nothing here yet', hint, action, className = '', children }) {
  const Icon = icon;
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center text-slate-400',
        className,
      )}
    >
      <Icon size={32} className="mb-3 text-slate-300" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
      {children}
    </div>
  );
}

export default EmptyState;
