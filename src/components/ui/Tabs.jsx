/**
 * Tabs — controlled or uncontrolled. Underline style to match the app.
 *
 *   <Tabs defaultValue="overview">
 *     <TabsList>
 *       <TabsTrigger value="overview">Overview</TabsTrigger>
 *       <TabsTrigger value="calls" count={12}>Calls</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="overview"> … </TabsContent>
 *     <TabsContent value="calls"> … </TabsContent>
 *   </Tabs>
 *
 * `role="tablist"` with Left/Right/Home/End roving focus; panels are linked
 * back to their trigger with aria ids.
 */

import React, { createContext, useContext, useId, useRef, useState } from 'react';
import { cn } from './cn.js';

const TabsContext = createContext(null);

export function Tabs({ value, defaultValue, onValueChange, className = '', children }) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value !== undefined ? value : internal;
  const baseId = useId();

  const setValue = (v) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value: current, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children }) {
  const listRef = useRef(null);

  const onKeyDown = (e) => {
    const tabs = [...(listRef.current?.querySelectorAll('[role="tab"]:not([disabled])') || [])];
    const idx = tabs.indexOf(document.activeElement);
    if (idx < 0) return;
    let next;
    if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) {
      e.preventDefault();
      next.focus();
      next.click();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn('flex items-center gap-1 border-b border-slate-200', className)}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, count, disabled = false, className = '', children }) {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      onClick={() => ctx.setValue(value)}
      className={cn(
        '-mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        active
          ? 'border-brand-600 text-brand-700'
          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
      {count != null && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
            active ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function TabsContent({ value, className = '', children }) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      tabIndex={0}
      className={cn('vetta-fade-in focus-visible:outline-none', className)}
    >
      {children}
    </div>
  );
}

export default Tabs;
