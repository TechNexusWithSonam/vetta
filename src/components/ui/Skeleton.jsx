/**
 * Skeleton loaders. `Skeleton` is the primitive (unchanged from the original
 * `components/ui.jsx`); `SkeletonText` and `SkeletonTable` cover the two shapes
 * pages repeat most.
 */

import React from 'react';
import { cn } from './cn.js';

export function Skeleton({ className = '' }) {
  return <div className={cn('animate-pulse rounded bg-slate-100', className)} />;
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={cn('space-y-2.5', className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-9', c === 0 ? 'w-1/3' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
