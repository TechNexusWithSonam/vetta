/** Shared display formatters used across the wired-up pages. */

export const num = (n) => Number(n || 0).toLocaleString();

export const money = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

/** Accepts either a 0–1 fraction or an already-scaled 0–100 value. */
export const pct = (v) => {
  const n = Number(v || 0);
  return `${(n <= 1 ? n * 100 : n).toFixed(1)}%`;
};

export const humanize = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());

export function relativeTime(value) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const future = diffMs < 0;
  const mins = Math.round(Math.abs(diffMs) / 60000);
  const fmt = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'} ${future ? 'from now' : 'ago'}`;
  if (mins < 1) return 'just now';
  if (mins < 60) return fmt(mins, 'min');
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return fmt(hrs, 'hr');
  return fmt(Math.round(hrs / 24), 'day');
}

/** "Aug 4, 2026 · 2:00 PM" */
export function dateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString(
    undefined,
    { hour: 'numeric', minute: '2-digit' },
  )}`;
}

/** Full name from a lead/contact-ish object, falling back to email. */
export const personName = (p) =>
  [p?.firstName, p?.lastName].filter(Boolean).join(' ') || p?.name || p?.email || '—';

/** Initials for an avatar bubble. */
export const initials = (text) =>
  String(text || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
