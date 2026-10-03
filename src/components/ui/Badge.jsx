/**
 * Badge — a small status / category pill. `tone` maps to the palette used
 * across the app for statuses (see existing pages: emerald=good, amber=pending,
 * rose=failed, etc.). Pass `dot` for a leading status dot.
 */

import React from 'react';
import { cn } from './cn.js';

const TONES = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
};

const DOT_TONES = {
  neutral: 'bg-slate-400',
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-blue-500',
};

const SIZES = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
};

export function Badge({ tone = 'neutral', size = 'md', dot = false, className = '', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset',
        TONES[tone],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT_TONES[tone])} aria-hidden="true" />}
      {children}
    </span>
  );
}

export default Badge;
