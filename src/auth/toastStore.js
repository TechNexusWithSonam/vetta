import { createContext } from 'react';

/**
 * @typedef {(message: string, opts?: { tone?: 'success'|'error'|'info', duration?: number }) => string} ToastFn
 * @type {import('react').Context<null | {
 *   toast: ToastFn,
 *   success: ToastFn,
 *   error: ToastFn,
 *   info: ToastFn,
 *   dismiss: (id: string) => void,
 * }>}
 */
export const ToastContext = createContext(null);
