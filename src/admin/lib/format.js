/** Admin-specific formatters (the shared `lib/format` `pct` treats <=1 as a fraction, which is wrong for already-scaled percentages). */
import { humanize } from '../../lib/format';

/** Already-scaled percentage (e.g. 42.5 -> "42.5%"); null/undefined -> "—" (not computable, e.g. no data). */
export function percent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(1)}%`;
}

/** Currency with 2dp; null/undefined -> "—". */
export function currency(value, code = 'USD') {
  if (value === null || value === undefined) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${code} ${Number(value).toFixed(2)}`;
  }
}

export const label = (value) => (value ? humanize(value) : '—');

export const fullName = (u) => [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.name || '—';

export const shortId = (id) => (id ? String(id).slice(0, 8) : '—');

/** Drop empty-string/undefined filters so they are never sent (the API rejects unknown/empty enum values). */
export function cleanParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null));
}
