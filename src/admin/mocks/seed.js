/**
 * Deterministic mock data helpers. Using a seeded PRNG (rather than
 * `Math.random()`) keeps organization/user/invoice names and numbers stable
 * across re-renders and reloads within a session, so a demo doesn't look like
 * it's flickering between different fake companies every time a component
 * re-fetches.
 */

/** mulberry32 — small, fast, seedable PRNG. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededArray(n, seed, mapFn) {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, (_, i) => mapFn(i, rand));
}

export function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

export function randomInt(rand, min, max) {
  return Math.floor(min + rand() * (max - min + 1));
}

export function daysAgoIso(rand, maxDays) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(rand, 0, maxDays));
  return d.toISOString();
}

export const COMPANY_NAMES = [
  'Acme Outbound', 'Northwind Sales', 'Blue Harbor Media', 'Lumen Growth', 'Vertex Dialers',
  'Orbit Reach', 'Summit Connect', 'Beacon Leads', 'Fieldstone Group', 'Nimbus Outreach',
  'Cascade Sales Co', 'Ironclad SDR', 'Redwood Prospecting', 'Skyline Ventures', 'Anchor Growth',
  'Pioneer Dialers', 'Frontier Outbound', 'Meridian Sales', 'Cobalt Reach', 'Harbor Light SDR',
  'Palm & Co', 'Granite Sales Ops', 'Bluewave Prospecting', 'Solstice Outreach', 'Timberline Growth',
];

export const FIRST_NAMES = ['Ava', 'Liam', 'Noah', 'Mia', 'Ethan', 'Sofia', 'Lucas', 'Zoe', 'Mason', 'Ella', 'Owen', 'Ivy'];
export const LAST_NAMES = ['Carter', 'Bennett', 'Ramirez', 'Wong', 'Patel', 'Hughes', 'Fischer', 'Diaz', 'Okafor', 'Nash'];

export function personEmail(first, last, domain) {
  return `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`;
}

export function companyDomain(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`;
}
