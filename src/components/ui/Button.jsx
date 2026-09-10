/**
 * Button — the one clickable primitive for the whole product.
 *
 * - `variant`: primary | secondary | outline | ghost | danger | link
 * - `size`:    sm | md | lg  (pass `iconOnly` for a square icon button)
 * - `loading`: shows a spinner, keeps the box the same size, sets aria-busy
 * - `as`:      render a different element/component (e.g. React Router `Link`).
 *              For a link, `disabled`/`loading` set `aria-disabled` rather than
 *              the invalid `disabled` attribute.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './cn.js';

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',
  outline:
    'bg-transparent text-brand-700 border border-brand-300 hover:bg-brand-50 active:bg-brand-100',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
  danger:
    'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800',
  link: 'bg-transparent text-brand-600 hover:text-brand-700 hover:underline underline-offset-4',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-11 px-5 text-[15px] rounded-lg',
};

const ICON_ONLY_SIZES = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-11 w-11' };
const ICON_PX = { sm: 14, md: 16, lg: 16 };

export function Button({
  as,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  iconOnly = false,
  fullWidth = false,
  className = '',
  children,
  type,
  ref,
  ...props
}) {
  const Comp = as || 'button';
  const isNativeButton = Comp === 'button';
  const isDisabled = disabled || loading;
  const iconSize = ICON_PX[size];

  const classes = cn(
    'relative inline-flex select-none items-center justify-center gap-2 font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
    isDisabled && 'cursor-not-allowed opacity-55',
    variant === 'link' ? 'text-sm' : SIZES[size],
    iconOnly && variant !== 'link' && cn('gap-0 px-0', ICON_ONLY_SIZES[size]),
    fullWidth && 'w-full',
    VARIANTS[variant],
    className,
  );

  const extra = isNativeButton
    ? { type: type || 'button', disabled: isDisabled }
    : { 'aria-disabled': isDisabled || undefined };

  return (
    <Comp ref={ref} className={classes} aria-busy={loading || undefined} {...extra} {...props}>
      {loading && (
        <Loader2
          size={iconSize}
          aria-hidden="true"
          className={cn('animate-spin', !iconOnly && children != null && 'absolute')}
        />
      )}
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2',
          loading && !iconOnly && children != null && 'opacity-0',
        )}
      >
        {IconLeft && <IconLeft size={iconSize} aria-hidden="true" />}
        {!iconOnly && children}
        {IconRight && <IconRight size={iconSize} aria-hidden="true" />}
      </span>
    </Comp>
  );
}

export default Button;
