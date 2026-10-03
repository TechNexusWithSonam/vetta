/**
 * Tooltip — a short hint on hover / focus. Wraps its children in an inline
 * span that carries the pointer/focus handlers (focus events bubble, so a
 * focusable child still triggers it) and links the hint with `aria-describedby`.
 * Presentational content only — never put essential info here.
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { cn } from './cn.js';

const SIDES = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ label, side = 'top', delay = 150, children, className = '', wrapperClassName = '' }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const id = useId();

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!label) return children;

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span
      className={cn('relative inline-flex', wrapperClassName)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            'vetta-menu-in pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md',
            SIDES[side],
            className,
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}

export default Tooltip;
