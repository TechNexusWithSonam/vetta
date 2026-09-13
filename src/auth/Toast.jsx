/**
 * Minimal toast notifications. One `<ToastProvider>` near the app root; fire
 * them with `useToast()` (from `./useToast`) anywhere below it. Toasts
 * auto-dismiss, stack top-right, and are announced via a polite live region.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext } from './toastStore.js';

const TONES = {
  success: { icon: CheckCircle2, ring: 'ring-emerald-200', text: 'text-emerald-600' },
  error: { icon: AlertCircle, ring: 'ring-rose-200', text: 'text-rose-600' },
  info: { icon: Info, ring: 'ring-indigo-200', text: 'text-indigo-600' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const handle = timers.current.get(id);
    if (handle) {
      clearTimeout(handle);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, { tone = 'info', duration = 4500 } = {}) => {
      const id = crypto.randomUUID?.() || String(Date.now() + Math.random());
      setToasts((list) => [...list, { id, message, tone }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (m, o) => push(m, { ...o, tone: 'success' }),
      error: (m, o) => push(m, { ...o, tone: 'error' }),
      info: (m, o) => push(m, { ...o, tone: 'info' }),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-4 sm:items-end sm:pr-6"
        role="region"
        aria-label="Notifications"
      >
        <div aria-live="polite" aria-atomic="false" className="contents">
          {toasts.map((t) => {
            const { icon: Icon, ring, text } = TONES[t.tone] || TONES.info;
            return (
              <div
                key={t.id}
                role="status"
                className={`vetta-pop-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-slate-700 shadow-lg ring-1 ${ring}`}
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${text}`} aria-hidden="true" />
                <p className="flex-1 leading-snug">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="-m-1 rounded p-1 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
