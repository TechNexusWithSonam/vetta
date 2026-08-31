/**
 * Full step-by-step feature audit against https://vetta-backend.vercel.app.
 * Registers a fresh org under a plus-addressed sonamjaiswal1919 email and
 * exercises every page's API flow, then prints a categorised findings list.
 *
 * Run: node scripts/feature-audit.mjs
 */
import { api, ApiError } from '../src/api/index.js';
import { API_BASE_URL } from '../src/api/config.js';

const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  }
};
globalThis.localStorage = globalThis.window.localStorage;

const stamp = Date.now();
const EMAIL = `sonamjaiswal1919+e2e${stamp}@gmail.com`;

const ok = [];
const bugs = [];
const backend = [];
const notes = [];
const emsg = (e) =>
  e instanceof ApiError
    ? Array.isArray(e.body?.message)
      ? e.body.message.join('; ')
      : e.message
    : e?.message || String(e);

async function T(label, fn, opts = {}) {
  // `opts.expect` is an HTTP *error* status the call should throw with.
  try {
    const v = await fn();
    if (opts.expect && opts.expect >= 400) {
      bugs.push(`${label} - expected ${opts.expect} but call succeeded`);
      return v;
    }
    ok.push(label);
    return v;
  } catch (e) {
    const code = e instanceof ApiError ? e.statusCode : 0;
    if (opts.expect && code === opts.expect) {
      ok.push(`${label} (${code} as expected)`);
      return undefined;
    }
    if (opts.backend) {
      backend.push(`${label} - ${code} ${emsg(e)}`);
      return undefined;
    }
    bugs.push(`${label} - ${code} ${emsg(e)}`);
    return undefined;
  }
}
const has = (obj, keys, where) => {
  const missing = keys.filter((k) => obj == null || !(k in obj));
  if (missing.length) notes.push(`${where}: response missing key(s) ${missing.join(', ')}`);
};

console.log(`Backend  : ${API_BASE_URL}`);
console.log(`Test user: ${EMAIL}\n`);

// ============ AUTH ============
const reg = await T(
  'Auth - register',
  () =>
    api.auth.register({
      organizationName: `Sonam E2E ${stamp}`,
      email: EMAIL,
      password: 'TestPass123!',
      firstName: 'Sonam',
      lastName: 'Jaiswal'
    }),
  {}
);
has(reg?.user, ['id', 'email', 'firstName', 'lastName', 'role', 'organizationId'], 'register.user');
const me = await T('Auth - me', () => api.auth.me());
has(me, ['id', 'email', 'role', 'organizationId'], 'auth/me');
if (me && !('firstName' in me))
  notes.push(
    'auth/me omits firstName/lastName/organizationName - header & profile UI can only show a name right after login, not after a reload'
  );
await T('Auth - login wrong pw (-> 401)', () => api.auth.login({ email: EMAIL, password: 'nope-wrong-1' }), {
  expect: 401
});
await T('Auth - login', () => api.auth.login({ email: EMAIL, password: 'TestPass123!' }));
await T('Auth - refresh', () => api.auth.refresh());
await T(
  'Auth - register dup (-> 409)',
  () => api.auth.register({ organizationName: 'x', email: EMAIL, password: 'TestPass123!', firstName: 'a', lastName: 'b' }),
  { expect: 409 }
);
await api.auth.login({ email: EMAIL, password: 'TestPass123!' });

// ============ LEADS ============
const lead = await T('Leads - create', () =>
  api.leads.create({
    email: `lead1+${stamp}@ex.co`,
    firstName: 'Priya',
    lastName: 'Nair',
    company: 'Brightwave',
    title: 'VP Sales',
    phone: '+15550192834',
    linkedinUrl: 'https://linkedin.com/in/priya',
    status: 'NEW',
    source: 'MANUAL',
    tags: ['e2e']
  })
);
has(lead, ['id', 'email', 'status', 'source', 'createdAt'], 'leads.create');
const leadId = lead?.id;
const list = await T('Leads - list (page/limit)', () => api.leads.list({ page: 1, limit: 20 }));
has(list, ['data', 'total', 'page', 'limit'], 'leads.list');
await T('Leads - filter by status', () => api.leads.list({ page: 1, limit: 20, status: 'NEW' }));
await T('Leads - filter by source', () => api.leads.list({ page: 1, limit: 20, source: 'MANUAL' }));
await T('Leads - search', () => api.leads.list({ page: 1, limit: 20, search: 'Priya' }));
await T('Leads - limit>100 (-> 400 cap)', () => api.leads.list({ page: 1, limit: 200 }), { expect: 400 });
await T('Leads - analytics', () => api.leads.analytics());
await T('Leads - get', () => api.leads.get(leadId));
await T('Leads - update', () => api.leads.update(leadId, { title: 'SVP Sales' }));
await T('Leads - update status', () => api.leads.updateStatus(leadId, 'CONTACTED'));
await T('Leads - assign to self', () => api.leads.assign(leadId, me?.id));
await T('Leads - add note', () => api.leads.addNote(leadId, { content: 'e2e note', type: 'NOTE' }));
await T('Leads - list notes', () => api.leads.listNotes(leadId, { page: 1, limit: 20 }));
await T('Leads - timeline', () => api.leads.timeline(leadId));
await T('Leads - bad uuid (-> 400)', () => api.leads.get('nope'), { expect: 400 });
await T('Leads - missing email (-> 400)', () => api.leads.create({ firstName: 'x' }), { expect: 400 });
await T('Leads - dup email (-> 409)', () => api.leads.create({ email: `lead1+${stamp}@ex.co` }), { expect: 409 });

// CSV-import style bulk create (what the Import Leads page does)
let created = 0;
let dup = 0;
let failed = 0;
for (const row of [
  { source: 'CSV_IMPORT', email: `imp1+${stamp}@ex.co`, firstName: 'Marcus', company: 'Orbit' },
  { source: 'CSV_IMPORT', email: `imp2+${stamp}@ex.co`, firstName: 'Dana', lastName: 'Liu' },
  { source: 'CSV_IMPORT', email: `lead1+${stamp}@ex.co` }
]) {
  try {
    await api.leads.create(row);
    created += 1;
  } catch (e) {
    if (e.statusCode === 409) dup += 1;
    else failed += 1;
  }
}
created === 2 && dup === 1 && failed === 0
  ? ok.push('Import - CSV bulk create (2 created / 1 dup)')
  : bugs.push(`Import - CSV bulk create unexpected: created=${created} dup=${dup} failed=${failed}`);

// ============ RESEARCH ============
await T('Research - list', () => api.research.list({ page: 1, limit: 20 }));
await T('Research - cost-analytics', () => api.research.costAnalytics());
const rj = await T('Research - start', () => api.research.start({ leadId, type: 'COMPANY_RESEARCH' }));
has(rj, ['id', 'leadId', 'type', 'status', 'createdAt'], 'research.start');
if (rj?.id) {
  await T('Research - get', () => api.research.get(rj.id));
  await T('Research - provider-logs', () => api.research.providerLogs(rj.id));
}
await T('Research - unimpl type (-> 422)', () => api.research.start({ leadId, type: 'PERSON_RESEARCH' }), { expect: 422 });

// ============ CAMPAIGN TEMPLATES ============
await T('CampaignTemplates - bare {name} (-> 400)', () => api.campaignTemplates.create({ name: `bare ${stamp}` }), {
  expect: 400,
  backend: true
});
const tpl = await T('CampaignTemplates - create (full)', () =>
  api.campaignTemplates.create({
    name: `Tpl ${stamp}`,
    description: 'e2e',
    scriptPromptKey: 'company_summary',
    defaultScheduleConfig: { timezone: 'UTC', businessHoursStart: '09:00', businessHoursEnd: '17:00', workDays: [1, 2, 3, 4, 5] }
  })
);
await T('CampaignTemplates - list', () => api.campaignTemplates.list({ page: 1, limit: 20 }));
if (tpl?.id) {
  await T('CampaignTemplates - get', () => api.campaignTemplates.get(tpl.id));
  await T('CampaignTemplates - update', () => api.campaignTemplates.update(tpl.id, { description: 'e2e v2' }));
}

// ============ LAUNCH CAMPAIGN (full lifecycle) ============
const camp = await T('Launch - create campaign (w/ template)', () =>
  api.campaigns.create({ name: `E2E Campaign ${stamp}`, description: 'e2e', templateId: tpl?.id, config: {} })
);
has(camp, ['id', 'name', 'status', 'totalLeads', 'config', 'createdAt'], 'campaigns.create');
const campId = camp?.id;
await T('Launch - assign leads', () => api.campaigns.assignLeads(campId, [leadId]));
await T('Launch - list campaign leads', () => api.campaigns.listLeads(campId, { page: 1, limit: 20 }));
await T('Launch - mark ready', () => api.campaigns.markReady(campId));
await T('Launch - configure schedule', () =>
  api.campaigns.configureSchedule(campId, {
    timezone: 'UTC',
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    workDays: [1, 2, 3, 4, 5],
    dailyCallLimit: 150
  })
);
const started = await T('Launch - start', () => api.campaigns.start(campId));
started?.status === 'RUNNING'
  ? ok.push('Launch - campaign reached RUNNING')
  : bugs.push(`Launch - campaign status after start = ${started?.status}`);
await T('Campaigns - pause', () => api.campaigns.pause(campId));
await T('Campaigns - resume', () => api.campaigns.resume(campId));
await T('Campaigns - list (filter status)', () => api.campaigns.list({ page: 1, limit: 20, status: 'RUNNING' }));
await T('Campaigns - get', () => api.campaigns.get(campId));
await T('Campaigns - update', () => api.campaigns.update(campId, { description: 'e2e updated' }));
await T('Campaigns - clone', () => api.campaigns.clone(campId, { name: `E2E Clone ${stamp}`, includeLeads: false }));
const canalytics = await T('Campaigns - analytics (rates)', () => api.campaigns.analytics(campId));
has(canalytics, ['connectRate', 'answerRate', 'meetingRate', 'conversionRate', 'totalLeads'], 'campaigns.analytics');
await T('Campaigns - metrics', () => api.campaigns.metrics(campId));
await T('Campaigns - logs', () => api.campaigns.logs(campId, { page: 1, limit: 20 }));
await T('Campaigns - history', () => api.campaigns.history(campId, { page: 1, limit: 20 }));
await T('Campaigns - events', () => api.campaigns.events(campId, { page: 1, limit: 20 }));
await T('Campaigns - list retry rules', () => api.campaigns.listRetryRules(campId));
await T('Campaigns - upsert retry rule', () =>
  api.campaigns.upsertRetryRule(campId, { reason: 'NO_ANSWER', maxAttempts: 3, backoffType: 'EXPONENTIAL' })
);
await T('Campaigns - delete retry rule', () => api.campaigns.deleteRetryRule(campId, 'NO_ANSWER'));

// ============ CALL STRATEGY ============
await T('CallStrategy - list', () => api.callStrategies.list({ page: 1, limit: 20 }));
await T('CallStrategy - start w/o research (-> 422)', () => api.callStrategies.start({ leadId }), { expect: 422 });

// ============ QUALIFICATION FRAMEWORKS ============
const qf = await T('QualFrameworks - create', () =>
  api.qualificationFrameworks.create({ name: `BANT ${stamp}`, type: 'BANT', isActive: true })
);
await T('QualFrameworks - list', () => api.qualificationFrameworks.list({ page: 1, limit: 20 }));
if (qf?.id) {
  await T('QualFrameworks - get', () => api.qualificationFrameworks.get(qf.id));
  await T('QualFrameworks - update', () => api.qualificationFrameworks.update(qf.id, { name: `BANT ${stamp} v2` }));
  await T('QualFrameworks - delete', () => api.qualificationFrameworks.remove(qf.id));
}

// ============ OBJECTIONS ============
const objs = await T('Objections - list (effective)', () => api.objections.list());
if (Array.isArray(objs)) {
  objs.length === 8
    ? ok.push('Objections - 8 default handlers present')
    : notes.push(`Objections - list returned ${objs.length} entries (expected 8)`);
  has(objs[0], ['type', 'recommendedResponse', 'isCustom'], 'objections[0]');
}
const ob = await T('Objections - create override', () =>
  api.objections.create({ type: 'NOT_INTERESTED', intent: 'e2e', recommendedResponse: 'e2e resp', isActive: true })
);
if (ob?.id) {
  await T('Objections - update override', () => api.objections.update(ob.id, { recommendedResponse: 'e2e v2' }));
  await T('Objections - delete override', () => api.objections.remove(ob.id));
}

// ============ VOICE ============
await T('Voice - list calls', () => api.voice.calls.list({ page: 1, limit: 20 }));
await T('Voice - DNC list', () => api.voice.doNotCall.list({ page: 1, limit: 20 }));
await T('Voice - DNC add', () =>
  api.voice.doNotCall.add({ phoneNumber: `+1555999${String(stamp).slice(-4)}`, reason: 'e2e' })
);
await T('Voice - retell webhook unsigned (-> 401)', () => api.voice.webhooks.retell({ event: 'call_ended' }), {
  expect: 401
});

// ============ CRM ============
await T('CRM - connections list', () => api.crm.connections.list());
await T('CRM - sync stats', () => api.crm.sync.stats());
await T('CRM - sync jobs', () => api.crm.sync.listJobs({ page: 1, limit: 20 }));
await T('CRM - activities', () => api.crm.activities());
await T('CRM - deals', () => api.crm.deals());
await T('CRM - companies', () => api.crm.companies());
await T('CRM - contacts', () => api.crm.contacts());
await T('CRM - mappings list', () => api.crm.mappings.list());
await T('CRM - unsupported provider (-> 400)', () =>
  api.crm.connections.create({ provider: 'SALESFORCE', credentials: { apiKey: 'x' } }), { expect: 400 });

// ============ CALENDAR ============
await T('Calendar - connections list', () => api.calendar.connections.list());
await T('Calendar - google oauth-url', () => api.calendar.connections.googleOAuthUrl());
await T(
  'Calendar - availability (no conn -> 400)',
  () =>
    api.calendar.availability({
      rangeStart: '2026-09-01T00:00:00.000Z',
      rangeEnd: '2026-09-08T00:00:00.000Z',
      durationMinutes: 30
    }),
  { expect: 400 }
);
await T('Calendar - meetings list', () => api.calendar.meetings.list({ page: 1, limit: 20 }));
await T('Calendar - meetings stats', () => api.calendar.meetings.stats({ windowDays: 7 }));
await T('Calendar - get working-hours', () => api.calendar.settings.getWorkingHours());
await T('Calendar - set working-hours', () =>
  api.calendar.settings.setWorkingHours({ days: [{ dayOfWeek: 1, intervals: [{ start: '09:00', end: '17:00' }], isActive: true }] })
);
await T('Calendar - list holidays', () => api.calendar.settings.listHolidays());
const hol = await T('Calendar - create holiday', () =>
  api.calendar.settings.createHoliday({ name: `Hol ${stamp}`, date: '2026-12-25', isRecurringYearly: true })
);
if (hol?.id) await T('Calendar - delete holiday', () => api.calendar.settings.deleteHoliday(hol.id));
await T('Calendar - get availability-rule', () => api.calendar.settings.getAvailabilityRule());
await T('Calendar - set availability-rule', () =>
  api.calendar.settings.setAvailabilityRule({ timezone: 'UTC', slotDurationMinutes: 30 })
);

// ============ NOTIFICATIONS ============
await T('Notif - unread-count', () => api.notifications.unreadCount());
await T('Notif - in-app list', () => api.notifications.listInApp({ page: 1, limit: 20 }));
await T('Notif - mark-all-read', () => api.notifications.markAllRead());
await T('Notif - preferences list', () => api.notifications.preferences.list());
await T('Notif - pref for event', () => api.notifications.preferences.getForEvent('research.completed'));
await T('Notif - set pref for event', () =>
  api.notifications.preferences.setForEvent('research.completed', { channel: 'IN_APP', enabled: true })
);
await T('Notif - templates list', () => api.notifications.templates.list());
const nt = await T('Notif - template create', () =>
  api.notifications.templates.create({
    templateKey: `e2e.${stamp}`,
    channel: 'EMAIL',
    locale: 'en',
    subject: 'Hi {{firstName}}',
    body: 'Body {{company}}'
  })
);
if (nt?.id) {
  await T('Notif - template get', () => api.notifications.templates.get(nt.id));
  await T('Notif - template update (draft)', () => api.notifications.templates.update(nt.id, { subject: 'Hi again' }));
  await T('Notif - template preview', () => api.notifications.templates.preview(nt.id, { firstName: 'S', company: 'X' }));
  await T('Notif - template publish', () => api.notifications.templates.publish(nt.id));
  await T('Notif - template versions', () => api.notifications.templates.listVersions(nt.id));
}
await T('Notif - webhook-configs list', () => api.notifications.webhookConfigs.list());
await T(
  'Notif - webhook-config register',
  () =>
    api.notifications.webhookConfigs.register({
      name: `Relay ${stamp}`,
      url: 'https://example.com/hook',
      eventKeys: ['meeting.created']
    }),
  { backend: true }
);
const nj = await T('Notif - send test', () =>
  api.notifications.sendTest({ eventKey: 'research.completed', channel: 'IN_APP', recipient: EMAIL, variables: { leadName: 'X' } })
);
if (nj?.id) {
  await T('Notif - job get', () => api.notifications.getJob(nj.id));
  await T('Notif - job logs', () => api.notifications.jobLogs(nj.id));
}

// ============ ANALYTICS ============
const exec = await T('Analytics - executive dashboard', () => api.analytics.dashboard.executive());
has(
  exec,
  ['totalLeads', 'leadsResearched', 'callsPlaced', 'connectRate', 'meetingsBooked', 'aiCostUsd', 'voiceCostUsd'],
  'analytics.dashboard.executive'
);
await T('Analytics - campaign dashboard', () => api.analytics.dashboard.campaign(campId));
await T('Analytics - agent dashboard', () => api.analytics.dashboard.agent(me?.id));
const vdash = await T('Analytics - voice dashboard', () => api.analytics.dashboard.voice());
has(vdash, ['callsPlaced', 'answerRate', 'connectRate', 'failedCalls', 'outcomes'], 'analytics.dashboard.voice');
await T('Analytics - ai dashboard', () => api.analytics.dashboard.ai());
await T('Analytics - crm dashboard', () => api.analytics.dashboard.crm());
await T('Analytics - system-health dashboard', () => api.analytics.dashboard.systemHealth());
await T('Analytics - events (OWNER)', () => api.analytics.events({ page: 1, limit: 20 }));
const funnel = await T('Analytics - funnel', () => api.analytics.funnel());
if (Array.isArray(funnel)) {
  funnel.length === 8
    ? ok.push('Analytics - funnel has 8 stages')
    : notes.push(`funnel returned ${funnel.length} stages`);
  has(funnel[0], ['label', 'count', 'conversionToNextPct'], 'funnel[0]');
}
await T('Analytics - daily report', () => api.analytics.reports.daily());
await T('Analytics - weekly report', () => api.analytics.reports.weekly());
await T('Analytics - monthly report', () => api.analytics.reports.monthly());
await T('Analytics - campaign report', () => api.analytics.reports.campaign(campId));
await T('Analytics - agent report', () => api.analytics.reports.agent(me?.id));
await T('Analytics - tenant report', () => api.analytics.reports.tenant());
const exp = await T('Analytics - request export', () =>
  api.analytics.exports.request({ type: 'MONTHLY', format: 'CSV', filters: { timezone: 'UTC' } })
);
if (exp?.id) await T('Analytics - export status', () => api.analytics.exports.status(exp.id));

// ============ SETTINGS ============
const settings = await T('Settings - get org settings', () => api.settings.get());
has(settings, ['timezone', 'locale', 'currency', 'dateFormat', 'timeFormat'], 'settings.get');
await T('Settings - bulk update', () => api.settings.bulkUpdate({ timezone: 'America/New_York', timeFormat: '24h' }));
await T('Settings - history', () => api.settings.history({ page: 1, limit: 20 }));
await T('Settings - get one (timezone)', () => api.settings.getOne('timezone'));
await T('Settings - set one (timezone)', () => api.settings.setOne('timezone', 'UTC'));
await T('Settings - reset one (timezone)', () => api.settings.resetOne('timezone'));
await T('Settings - branding get', () => api.settings.branding.get(), { backend: true });
await T('Settings - branding update', () => api.settings.branding.update({ primaryColor: '#1a73e8' }), { backend: true });
await T('Settings - credentials list', () => api.settings.credentials.list(), { backend: true });
await T('Settings - feature-flags get', () => api.settings.featureFlags.get(), { backend: true });
await T('Settings - feature-flag set', () => api.settings.featureFlags.set('BETA_ANALYTICS_EXPORT', { isEnabled: true }));
await T('Settings - preferences get', () => api.settings.preferences.get(), { backend: true });
await T('Settings - preferences update', () => api.settings.preferences.update({ theme: 'dark' }), { backend: true });
await T('Settings - providers list', () => api.settings.providers.list(), { backend: true });
await T('Settings - provider get (claude)', () => api.settings.providers.get('claude'));
await T('Settings - provider upsert (claude)', () =>
  api.settings.providers.upsert('claude', { isEnabled: true, config: { model: 'claude-opus-5' } })
);
const ex2 = await T('Settings - export', () => api.settings.export());
if (ex2) await T('Settings - import preview', () => api.settings.import({ data: ex2, confirm: false }));

// ============ SYSTEM ============
await T('System - health', () => api.system.health(), { backend: true });
await T('System - ready', () => api.system.ready());
await T('System - live', () => api.system.live());

// ============ CLEANUP ============
await T('Cleanup - archive campaign', async () => {
  try {
    await api.campaigns.pause(campId);
  } catch {
    /* not running */
  }
  return api.campaigns.archive(campId);
});
await T('Cleanup - delete campaign', () => api.campaigns.remove(campId));
await T('Cleanup - delete lead', () => api.leads.remove(leadId));

// ============ REPORT ============
console.log('\n================ RESULT ================');
console.log(
  `PASS: ${ok.length}   BUGS: ${bugs.length}   BACKEND ISSUES: ${backend.length}   NOTES: ${notes.length}\n`
);
if (bugs.length) {
  console.log('--- BUGS (client / unexpected) ---');
  bugs.forEach((b) => console.log('  x ' + b));
  console.log();
}
if (backend.length) {
  console.log('--- BACKEND ISSUES (client matches the collection; deployment at fault) ---');
  backend.forEach((b) => console.log('  ! ' + b));
  console.log();
}
if (notes.length) {
  console.log('--- NOTES / MISSING KEYS ---');
  notes.forEach((n) => console.log('  . ' + n));
  console.log();
}
console.log('--- PASSED ---');
ok.forEach((o) => console.log('  ok ' + o));
process.exit(bugs.length ? 1 : 0);
