/**
 * Verifies the `src/api` client against `AI-SDR-SaaS.postman_collection.json`.
 *
 * There is no running backend to hit, so this checks the next best thing: that
 * every request in the Postman collection is reachable through the client and
 * that the client emits the exact HTTP method, path and (envelope-aware) body
 * the collection documents. `fetch` is stubbed to capture each call.
 *
 * Run:  node scripts/verify-api-against-postman.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---- Minimal browser shims so the client + tokenStore load under Node --------
const store = new Map([
  ['vetta.auth.accessToken', 'test-access-token'],
  ['vetta.auth.refreshToken', 'test-refresh-token'],
]);
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
};
globalThis.localStorage = globalThis.window.localStorage;

// ---- fetch stub ------------------------------------------------------------
let lastCall = null;
globalThis.fetch = async (url, init = {}) => {
  lastCall = {
    method: (init.method || 'GET').toUpperCase(),
    url,
    headers: init.headers || {},
    body: init.body,
  };
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: { get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null) },
    text: async () => JSON.stringify({ success: true, data: {}, timestamp: new Date().toISOString() }),
    blob: async () => ({ __blob: true }),
  };
};

const { api, API_BASE_URL: BASE } = await import('../src/api/index.js');

// ---- Route normalization -------------------------------------------------
const ID = '__ID__';
const isIdSegment = (s) =>
  s === ID ||
  /^\{\{.+\}\}$/.test(s) ||
  s === 'not-a-valid-uuid' ||
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-/.test(s);

function routeKey(method, urlPath) {
  const segs = urlPath.split('?')[0].split('/').filter(Boolean).map((s) => (isIdSegment(s) ? ':id' : s));
  return `${method} /${segs.join('/')}`;
}

// ---- Expected routes from the Postman collection -----------------------
const collection = JSON.parse(fs.readFileSync(path.join(root, 'AI-SDR-SaaS.postman_collection.json'), 'utf8'));
const expected = new Map(); // routeKey -> sample folder/name
(function walk(items, folder) {
  for (const it of items) {
    if (it.item) { walk(it.item, folder ? `${folder} / ${it.name}` : it.name); continue; }
    const raw = (typeof it.request?.url === 'object' ? it.request.url.raw : it.request?.url) || '';
    const p = raw.replace('{{baseUrl}}', '').replace(/\{\{\w+\}\}/g, ID);
    const key = routeKey(it.request.method, p);
    if (!expected.has(key)) expected.set(key, `${folder} / ${it.name}`);
  }
})(collection.item || [], '');

// ---- Client invocations (one per distinct collection route) -----------
/** @type {Array<() => unknown>} */
const calls = [
  // Auth
  () => api.auth.register({ organizationName: 'A', email: 'a@b.co', password: 'x', firstName: 'A', lastName: 'B' }),
  () => api.auth.login({ email: 'a@b.co', password: 'x' }),
  () => api.auth.me(),
  () => api.auth.refresh('rt'),
  () => api.auth.logout('rt'),
  // Leads
  () => api.leads.create({ email: 'a@b.co' }),
  () => api.leads.list({ page: 1, limit: 20 }),
  () => api.leads.analytics(),
  () => api.leads.get(ID),
  () => api.leads.update(ID, { title: 'x' }),
  () => api.leads.updateStatus(ID, 'CONTACTED'),
  () => api.leads.assign(ID, ID),
  () => api.leads.addNote(ID, { content: 'x' }),
  () => api.leads.listNotes(ID, { page: 1, limit: 20 }),
  () => api.leads.timeline(ID),
  () => api.leads.remove(ID),
  // Imports
  () => api.imports.createLeadImport({ fileKey: 'k', mapping: {} }),
  () => api.imports.listLeadImports({ page: 1, limit: 20 }),
  () => api.imports.getLeadImport(ID),
  // Prompt Templates
  () => api.promptTemplates.list(),
  () => api.promptTemplates.create({ key: 'k' }),
  () => api.promptTemplates.update(ID, { description: 'x' }),
  () => api.promptTemplates.createVersion(ID, { content: 'x' }),
  () => api.promptTemplates.listVersions(ID),
  // Research
  () => api.research.start({ leadId: ID, type: 'COMPANY_RESEARCH' }),
  () => api.research.list({ page: 1, limit: 20 }),
  () => api.research.costAnalytics({}),
  () => api.research.get(ID),
  () => api.research.retry(ID),
  () => api.research.providerLogs(ID),
  // Campaign Templates
  () => api.campaignTemplates.create({ name: 'x' }),
  () => api.campaignTemplates.list({ page: 1, limit: 20 }),
  () => api.campaignTemplates.get(ID),
  () => api.campaignTemplates.update(ID, { name: 'x' }),
  () => api.campaignTemplates.remove(ID),
  // Campaigns
  () => api.campaigns.create({ name: 'x' }),
  () => api.campaigns.list({ page: 1, limit: 20 }),
  () => api.campaigns.get(ID),
  () => api.campaigns.update(ID, { name: 'x' }),
  () => api.campaigns.markReady(ID),
  () => api.campaigns.configureSchedule(ID, {}),
  () => api.campaigns.start(ID),
  () => api.campaigns.pause(ID),
  () => api.campaigns.resume(ID),
  () => api.campaigns.archive(ID),
  () => api.campaigns.clone(ID, { name: 'x' }),
  () => api.campaigns.assignLeads(ID, [ID]),
  () => api.campaigns.listLeads(ID, { page: 1, limit: 20 }),
  () => api.campaigns.removeLead(ID, ID),
  () => api.campaigns.remove(ID),
  () => api.campaigns.metrics(ID),
  () => api.campaigns.analytics(ID),
  () => api.campaigns.logs(ID, { page: 1, limit: 20 }),
  () => api.campaigns.history(ID, { page: 1, limit: 20 }),
  () => api.campaigns.events(ID, { page: 1, limit: 20 }),
  () => api.campaigns.listRetryRules(ID),
  () => api.campaigns.upsertRetryRule(ID, { reason: 'NO_ANSWER' }),
  () => api.campaigns.deleteRetryRule(ID, 'NO_ANSWER'),
  // Call Strategy
  () => api.callStrategies.start({ leadId: ID }),
  () => api.callStrategies.list({ page: 1, limit: 20 }),
  () => api.callStrategies.get(ID),
  () => api.callStrategies.retry(ID),
  () => api.callStrategies.listVersions(ID),
  () => api.callStrategies.publishedVersion(ID),
  () => api.callStrategies.publish(ID, ID),
  () => api.callStrategies.rollback(ID, ID),
  () => api.callStrategies.providerLogs(ID),
  () => api.callStrategies.logs(ID, { page: 1, limit: 20 }),
  // Qualification Frameworks
  () => api.qualificationFrameworks.create({ name: 'x', type: 'BANT' }),
  () => api.qualificationFrameworks.list({ page: 1, limit: 20 }),
  () => api.qualificationFrameworks.get(ID),
  () => api.qualificationFrameworks.update(ID, { name: 'x' }),
  () => api.qualificationFrameworks.remove(ID),
  // Objections
  () => api.objections.list(),
  () => api.objections.create({ type: 'NOT_INTERESTED' }),
  () => api.objections.update(ID, { intent: 'x' }),
  () => api.objections.remove(ID),
  // Voice
  () => api.voice.calls.create({ leadId: ID }),
  () => api.voice.calls.list({ page: 1, limit: 20 }),
  () => api.voice.calls.get(ID),
  () => api.voice.calls.cancel(ID),
  () => api.voice.calls.scheduleCallback(ID, '2026-08-20T15:00:00.000Z'),
  () => api.voice.calls.transcript(ID),
  () => api.voice.calls.events(ID, { page: 1, limit: 50 }),
  () => api.voice.calls.recording(ID),
  () => api.voice.calls.outcome(ID),
  () => api.voice.webhooks.retell({ event: 'call_ended' }),
  () => api.voice.webhooks.bland({ event: 'call.completed' }),
  () => api.voice.doNotCall.list({ page: 1, limit: 20 }),
  () => api.voice.doNotCall.add({ phoneNumber: '+15551234567' }),
  // CRM
  () => api.crm.connections.create({ provider: 'HUBSPOT', credentials: {} }),
  () => api.crm.connections.list(),
  () => api.crm.connections.get(ID),
  () => api.crm.connections.test(ID),
  () => api.crm.connections.update(ID, { config: {} }),
  () => api.crm.connections.enable(ID),
  () => api.crm.connections.disable(ID),
  () => api.crm.connections.remove(ID),
  () => api.crm.sync.stats({}),
  () => api.crm.sync.listJobs({ page: 1, limit: 20 }),
  () => api.crm.sync.getJob(ID),
  () => api.crm.sync.retryJob(ID),
  () => api.crm.webhooks.hubspot({ eventId: 1 }),
  () => api.crm.webhooks.airtable({ base: { id: 'x' } }),
  () => api.crm.activities({}),
  () => api.crm.deals({}),
  () => api.crm.companies({}),
  () => api.crm.contacts({}),
  () => api.crm.mappings.create({ connectionId: ID, entityType: 'CONTACT', platformField: 'x', crmField: 'y' }),
  () => api.crm.mappings.list({}),
  () => api.crm.mappings.update(ID, { crmField: 'y' }),
  () => api.crm.mappings.remove(ID),
  // Calendar
  () => api.calendar.connections.create({ provider: 'CALENDLY', credentials: {} }),
  () => api.calendar.connections.list(),
  () => api.calendar.connections.get(ID),
  () => api.calendar.connections.test(ID),
  () => api.calendar.connections.enable(ID),
  () => api.calendar.connections.disable(ID),
  () => api.calendar.connections.update(ID, { config: {} }),
  () => api.calendar.connections.remove(ID),
  () => api.calendar.connections.googleOAuthUrl({}),
  () => api.calendar.connections.googleCallback({ code: 'c', state: 's' }),
  () => api.calendar.availability({ rangeStart: 'a', rangeEnd: 'b', durationMinutes: 30 }),
  () => api.calendar.meetings.create({ leadId: ID, startTimeIso: 'a', durationMinutes: 30 }),
  () => api.calendar.meetings.stats({ windowDays: 30 }),
  () => api.calendar.meetings.list({ page: 1, limit: 20 }),
  () => api.calendar.meetings.get(ID),
  () => api.calendar.meetings.logs(ID),
  () => api.calendar.meetings.reschedule(ID, { startTimeIso: 'a' }),
  () => api.calendar.meetings.cancel(ID, { reason: 'x' }),
  () => api.calendar.settings.getWorkingHours({}),
  () => api.calendar.settings.setWorkingHours({ days: [] }),
  () => api.calendar.settings.listHolidays(),
  () => api.calendar.settings.createHoliday({ name: 'x', date: '2026-12-25' }),
  () => api.calendar.settings.deleteHoliday(ID),
  () => api.calendar.settings.getAvailabilityRule({}),
  () => api.calendar.settings.setAvailabilityRule({ timezone: 'UTC' }),
  () => api.calendar.webhooks.google({}),
  () => api.calendar.webhooks.calendly({ event: 'invitee.created' }),
  // Notifications
  () => api.notifications.sendTest({ eventKey: 'research.completed', channel: 'EMAIL', recipient: 'a@b.co' }),
  () => api.notifications.getJob(ID),
  () => api.notifications.jobLogs(ID),
  () => api.notifications.cancelJob(ID),
  () => api.notifications.unreadCount(),
  () => api.notifications.listInApp({ page: 1, limit: 20 }),
  () => api.notifications.markAllRead(),
  () => api.notifications.markRead(ID),
  () => api.notifications.markUnread(ID),
  () => api.notifications.preferences.list(),
  () => api.notifications.preferences.getForEvent('research.completed'),
  () => api.notifications.preferences.setForEvent('research.completed', { channel: 'SLACK', enabled: false }),
  () => api.notifications.templates.list({}),
  () => api.notifications.templates.create({ templateKey: 'k', channel: 'EMAIL', body: 'x' }),
  () => api.notifications.templates.get(ID),
  () => api.notifications.templates.update(ID, { subject: 'x' }),
  () => api.notifications.templates.createVersion(ID),
  () => api.notifications.templates.publish(ID),
  () => api.notifications.templates.archive(ID),
  () => api.notifications.templates.listVersions(ID),
  () => api.notifications.templates.preview(ID, { firstName: 'x' }),
  () => api.notifications.webhookConfigs.list(),
  () => api.notifications.webhookConfigs.register({ name: 'x', url: 'https://e.co', eventKeys: [] }),
  () => api.notifications.webhookConfigs.get(ID),
  () => api.notifications.webhookConfigs.deactivate(ID),
  () => api.notifications.webhookConfigs.activate(ID),
  () => api.notifications.webhookConfigs.remove(ID),
  // Analytics
  () => api.analytics.dashboard.executive({}),
  () => api.analytics.dashboard.campaign(ID),
  () => api.analytics.dashboard.agent(ID, {}),
  () => api.analytics.dashboard.voice({}),
  () => api.analytics.dashboard.ai({}),
  () => api.analytics.dashboard.crm({}),
  () => api.analytics.dashboard.systemHealth(),
  () => api.analytics.events({ page: 1, limit: 20 }),
  () => api.analytics.exports.request({ type: 'MONTHLY', format: 'CSV' }),
  () => api.analytics.exports.status(ID),
  () => api.analytics.exports.download(ID),
  () => api.analytics.funnel({}),
  () => api.analytics.reports.daily({}),
  () => api.analytics.reports.weekly({}),
  () => api.analytics.reports.monthly({}),
  () => api.analytics.reports.campaign(ID, {}),
  () => api.analytics.reports.agent(ID, {}),
  () => api.analytics.reports.tenant({}),
  // Settings
  () => api.settings.get(),
  () => api.settings.history({ page: 1, limit: 20 }),
  () => api.settings.historyEntry(ID),
  () => api.settings.restoreFromHistory(ID),
  () => api.settings.getOne('timezone'),
  () => api.settings.setOne('timezone', 'America/New_York'),
  () => api.settings.bulkUpdate({ timezone: 'UTC' }),
  () => api.settings.resetOne('timezone'),
  () => api.settings.branding.get(),
  () => api.settings.branding.update({ primaryColor: '#1a73e8' }),
  () => api.settings.credentials.list(),
  () => api.settings.credentials.create({ category: 'AI', provider: 'claude', credential: 'xxxxxxxx' }),
  () => api.settings.credentials.rotate(ID, { credential: 'xxxxxxxx' }),
  () => api.settings.credentials.remove(ID),
  () => api.settings.featureFlags.get(),
  () => api.settings.featureFlags.set('BETA_ANALYTICS_EXPORT', { isEnabled: true }),
  () => api.settings.preferences.get(),
  () => api.settings.preferences.update({ theme: 'dark' }),
  () => api.settings.providers.list(),
  () => api.settings.providers.get('claude'),
  () => api.settings.providers.upsert('claude', { isEnabled: true }),
  () => api.settings.providers.remove('claude'),
  () => api.settings.export(),
  () => api.settings.import({ data: { version: 1 }, confirm: false }),
  // System
  () => api.system.health(),
  () => api.system.ready(),
  () => api.system.live(),
];

// ---- Run -------------------------------------------------------------
const produced = new Set();
let invokeFailures = 0;
for (const run of calls) {
  lastCall = null;
  try {
    await run();
  } catch (err) {
    invokeFailures += 1;
    console.error('  ✗ threw:', err?.message);
    continue;
  }
  if (!lastCall) {
    invokeFailures += 1;
    console.error('  ✗ produced no request:', run.toString());
    continue;
  }
  const urlPath = lastCall.url.startsWith(BASE) ? lastCall.url.slice(BASE.length) : lastCall.url;
  produced.add(routeKey(lastCall.method, urlPath));
}

const missing = [...expected.keys()].filter((k) => !produced.has(k));
const extra = [...produced].filter((k) => !expected.has(k));

console.log(`Postman routes (distinct):     ${expected.size}`);
console.log(`Client invocations executed:   ${calls.length}`);
console.log(`Client routes produced:        ${produced.size}`);
console.log(`Invocation failures:           ${invokeFailures}`);

if (missing.length) {
  console.log(`\n❌ ${missing.length} collection route(s) not covered by the client:`);
  for (const k of missing) console.log(`   - ${k}   (${expected.get(k)})`);
}
if (extra.length) {
  console.log(`\n⚠️  ${extra.length} client route(s) with no matching collection entry:`);
  for (const k of extra) console.log(`   - ${k}`);
}

// ---- Behavioural checks (envelope / auth / query / headers) ----------
let behaviourFailures = 0;
const check = (label, cond) => {
  if (cond) {
    console.log(`  ✓ ${label}`);
  } else {
    behaviourFailures += 1;
    console.error(`  ✗ ${label}`);
  }
};
console.log('\nBehavioural checks:');

// The coverage loop above runs auth.logout(), which clears stored tokens — reseed.
store.set('vetta.auth.accessToken', 'test-access-token');
store.set('vetta.auth.refreshToken', 'test-refresh-token');

lastCall = null;
const listResult = await api.leads.list({ page: 1, limit: 20, tags: ['a', 'b'], search: undefined });
check('list() unwraps the success envelope to `data`', JSON.stringify(listResult) === '{}');
check('query params serialize (page/limit)', lastCall.url.includes('?page=1&limit=20'));
check('array query params repeat', /(\?|&)tags=a&tags=b(&|$)/.test(lastCall.url));
check('undefined query params are dropped', !lastCall.url.includes('search='));
check('bearer token attached on authed calls', lastCall.headers.Authorization === 'Bearer test-access-token');

lastCall = null;
await api.leads.create({ email: 'a@b.co' });
check('POST body is JSON-stringified', lastCall.body === JSON.stringify({ email: 'a@b.co' }));
check('Content-Type set on body requests', lastCall.headers['Content-Type'] === 'application/json');

lastCall = null;
await api.auth.login({ email: 'a@b.co', password: 'x' });
check('auth/login sent WITHOUT a bearer token', !('Authorization' in lastCall.headers));

lastCall = null;
await api.system.health();
check('health check sent WITHOUT a bearer token', !('Authorization' in lastCall.headers));

lastCall = null;
await api.voice.webhooks.retell({ event: 'call_ended' });
check('provider webhooks sent WITHOUT a bearer token', !('Authorization' in lastCall.headers));

if (missing.length || extra.length || invokeFailures || behaviourFailures) {
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
console.log('\nRESULT: PASS — every Postman route is covered, matches, and behaves as specified.');
