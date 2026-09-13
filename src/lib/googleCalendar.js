/**
 * Google Calendar "add event" deep link — a prefilled compose URL the user
 * opens to add a meeting manually. No OAuth, no write, no new integration;
 * only ever built from a real booked meeting's own data.
 */
export function googleCalendarAddUrl({ title, description, location, startIso, endIso }) {
  const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Meeting',
    dates: `${stamp(startIso)}/${stamp(endIso)}`,
  });
  if (description) params.set('details', description);
  if (location) params.set('location', location);
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
