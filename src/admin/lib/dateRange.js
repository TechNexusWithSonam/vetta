/** Shared date-range picker for admin analytics/report views (mirrors pages/Dashboard.jsx's rangeParams). */
export const RANGE_OPTIONS = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
  '365d': { label: 'Last 12 months', days: 365 },
};

export function rangeParams(key) {
  const opt = RANGE_OPTIONS[key] || RANGE_OPTIONS['30d'];
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - opt.days);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to), timezone: 'UTC' };
}
