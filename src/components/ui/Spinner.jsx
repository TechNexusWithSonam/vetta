/**
 * Spinner + block-level loading helpers. The codebase already standardised on
 * lucide's `Loader2` spinning; `Spinner` just gives it a name and a size scale.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './cn.js';

const SIZES = { sm: 14, md: 18, lg: 24, xl: 32 };

export function Spinner({ size = 'md', className = '', label = 'Loading', ...props }) {
  return (
    <Loader2
      size={typeof size === 'number' ? size : SIZES[size]}
      className={cn('animate-spin text-slate-400', className)}
      role="status"
      aria-label={label}
      {...props}
    />
  );
}

/** Centered spinner for filling a card / panel / route while it loads. */
export function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-slate-400', className)}>
      <Spinner size="lg" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export default Spinner;
