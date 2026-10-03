import { useContext } from 'react';
import { ToastContext } from './toastStore.js';

/** Fire toast notifications. Must be used under a `<ToastProvider>`. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}
