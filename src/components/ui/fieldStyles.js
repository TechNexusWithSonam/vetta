/**
 * Shared field chrome classes, used by Input / Textarea / Select. Kept in a
 * plain module (no components) so Fast Refresh stays happy.
 *
 * Matches `src/auth/fields.jsx` so auth and app fields look identical.
 */

export const FIELD_BASE =
  'block w-full rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors duration-150 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

export function fieldTone(invalid) {
  return invalid
    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
    : 'border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-brand-500/10';
}
