import React from 'react';

/** Full-viewport "checking your session" state used by the route guards. */
export default function AuthLoading({ label = 'Loading your workspace…' }) {
  return (
    <div className="flex h-svh w-full items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
