/** Shared date-range picker for admin analytics/report views. Dates are inclusive UTC calendar days. */
export const RANGE_OPTIONS = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
  '365d': { label: 'Last 12 months', days: 365 },
};

export const RANGE_SELECT_OPTIONS = Object.entries(RANGE_OPTIONS).map(([value, v]) => ({ value, label: v.label }));

const isoDay = (d) => d.toISOString().slice(0, 10);

/** `{ from, to }` (YYYY-MM-DD) for a RANGE_OPTIONS key — exactly the query the /admin API accepts. */
export function rangeParams(key) {
  const opt = RANGE_OPTIONS[key] || RANGE_OPTIONS['30d'];
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (opt.days - 1));
  return { from: isoDay(from), to: isoDay(to) };
}

/** Current month as YYYY-MM (UTC). */
export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}
