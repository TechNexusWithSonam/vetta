import { seededArray, pick, daysAgoIso } from './seed.js';

const TYPES = [
  { title: 'Payment failed', body: 'A subscription payment failed and needs review.' },
  { title: 'High usage alert', body: 'An organization crossed 90% of its monthly usage limit.' },
  { title: 'New organization signed up', body: 'A new organization completed onboarding.' },
  { title: 'Subscription expiring soon', body: 'A trial subscription expires in 3 days.' },
];

let CACHE = null;

function getNotifications() {
  if (!CACHE) {
    CACHE = seededArray(18, 61, (i, rand) => {
      const t = pick(rand, TYPES);
      return { id: `notif_${i + 1}`, title: t.title, body: t.body, read: i > 4, createdAt: daysAgoIso(rand, 20) };
    });
  }
  return CACHE;
}

export function mockListNotifications({ page = 1, limit = 10, unreadOnly } = {}) {
  let items = getNotifications();
  if (unreadOnly) items = items.filter((n) => !n.read);
  items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = items.length;
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pageSize: limit };
}

export function mockMarkNotificationRead(id) {
  const n = getNotifications().find((x) => x.id === id);
  if (!n) throw new Error('Notification not found');
  n.read = true;
  return n;
}

export function mockBroadcastNotification({ title, message, audience } = {}) {
  const n = { id: `notif_${Date.now()}`, title, body: message, read: false, audience, createdAt: new Date().toISOString(), broadcast: true };
  getNotifications().unshift(n);
  return n;
}
