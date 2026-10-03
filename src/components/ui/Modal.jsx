/**
 * Modal — accessible dialog rendered in a portal on `document.body`.
 *
 * - `role="dialog"` + `aria-modal`, labelled by the title
 * - Escape and backdrop click close (disable via `dismissible={false}`)
 * - Body scroll locked while open
 * - Focus moves into the panel on open and is restored to the trigger on close;
 *   Tab is trapped within the panel
 *
 * `ConfirmDialog` is the common yes/no case built on top.
 */

import React, { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from './cn.js';
import { Button } from './Button.jsx';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  dismissible = true,
  hideClose = false,
  footer,
  className = '',
  children,
}) {
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);
  const titleId = useId();
  const descId = description ? `${titleId}-desc` : undefined;

  const close = useCallback(() => {
    if (dismissible) onClose?.();
  }, [dismissible, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    lastActiveRef.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Focus the first field, or the panel itself.
    const panel = panelRef.current;
    const first = panel?.querySelector(FOCUSABLE);
    (first || panel)?.focus?.();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = overflow;
      const last = lastActiveRef.current;
      if (last && typeof last.focus === 'function') last.focus();
    };
  }, [open, close]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <div
        className="vetta-overlay-in fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={descId}
        tabIndex={-1}
        className={cn(
          'vetta-panel-in relative z-10 my-8 w-full rounded-2xl bg-white shadow-pop outline-none sm:my-0',
          SIZES[size],
          className,
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-base font-semibold text-slate-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-1 text-sm text-slate-500">
                  {description}
                </p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={close}
                aria-label="Close dialog"
                className="-mr-1.5 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <X size={17} />
              </button>
            )}
          </div>
        )}

        <div className={cn('px-6', title || !hideClose ? 'pt-3' : 'pt-6', footer ? 'pb-2' : 'pb-6')}>
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      dismissible={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {typeof message === 'string' ? <p className="text-sm text-slate-600">{message}</p> : message}
    </Modal>
  );
}

export default Modal;
