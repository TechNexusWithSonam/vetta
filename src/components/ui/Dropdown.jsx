/**
 * Dropdown menu — a trigger button that opens a small action menu.
 *
 *   <Dropdown trigger={<><Settings size={15} /> Actions</>}>
 *     <DropdownItem icon={Pencil} onSelect={edit}>Edit</DropdownItem>
 *     <DropdownSeparator />
 *     <DropdownItem icon={Trash2} danger onSelect={remove}>Delete</DropdownItem>
 *   </Dropdown>
 *
 * `trigger` is the button's *content*; style the button with `triggerClassName`
 * (defaults to the secondary-button look) or pass `triggerProps`. Roving focus
 * with Arrow keys, Escape closes and restores focus to the trigger, outside
 * click closes. `role="menu"` / `role="menuitem"`.
 */

import React, { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { cn } from './cn.js';

const DropdownContext = createContext(null);

const ALIGN = {
  start: 'left-0 origin-top-left',
  end: 'right-0 origin-top-right',
};

const DEFAULT_TRIGGER =
  'inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';

export function Dropdown({
  trigger,
  children,
  align = 'end',
  className = '',
  menuClassName = '',
  triggerClassName,
  triggerProps = {},
  'aria-label': ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const closeAndFocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') closeAndFocus();
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, closeAndFocus]);

  useEffect(() => {
    if (!open) return;
    menuRef.current
      ?.querySelector('[role="menuitem"]:not([aria-disabled="true"])')
      ?.focus();
  }, [open]);

  const onMenuKeyDown = (e) => {
    const items = [
      ...(menuRef.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])') || []),
    ];
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <DropdownContext.Provider value={{ closeAndFocus }}>
      <div ref={rootRef} className={cn('relative inline-block text-left', className)}>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-label={ariaLabel}
          onClick={() => setOpen((v) => !v)}
          className={cn(triggerClassName || DEFAULT_TRIGGER)}
          {...triggerProps}
        >
          {trigger}
        </button>

        {open && (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-orientation="vertical"
            onKeyDown={onMenuKeyDown}
            className={cn(
              'vetta-menu-in absolute z-40 mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-pop',
              ALIGN[align],
              menuClassName,
            )}
          >
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownItem({
  icon: Icon,
  danger = false,
  disabled = false,
  onSelect,
  closeOnSelect = true,
  className = '',
  children,
  ...props
}) {
  const ctx = useContext(DropdownContext);
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        onSelect?.(e);
        if (closeOnSelect) ctx?.closeAndFocus();
      }}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500',
        disabled
          ? 'cursor-not-allowed text-slate-300'
          : danger
            ? 'text-rose-600 hover:bg-rose-50 focus:bg-rose-50'
            : 'text-slate-700 hover:bg-slate-100 focus:bg-slate-100',
        className,
      )}
      {...props}
    >
      {Icon && <Icon size={15} className="shrink-0" aria-hidden="true" />}
      <span className="truncate">{children}</span>
    </button>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-slate-100" />;
}

export function DropdownLabel({ children }) {
  return (
    <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </p>
  );
}

export default Dropdown;
