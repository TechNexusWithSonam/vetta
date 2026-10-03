/**
 * Super Admin — `/admin/*` (vetta-backend `src/modules/platform-admin/`).
 *
 * Plain calls to the real, server-authorized API: there is no mock or demo
 * fallback. Every endpoint is protected server-side by the platform
 * permission guard (401 unauthenticated, 403 missing permission), so the
 * panel's own permission checks are presentation only.
 *
 * List endpoints return `{ data, total, page, limit }`. Every function takes
 * an optional trailing `options` (e.g. `{ signal }`) forwarded to `http`.
 */
import { http } from '../client.js';

const get = (path, query, options) => http.get(path, { ...options, query });

export const admin = {
  /** `{ userId, email, roleName, isSuperAdmin, source, permissions[] }` — 403 if not a platform operator. */
  me: (options) => http.get('/admin/me', options),

  dashboard: {
    summary: (params, options) => get('/admin/dashboard/summary', params, options),
    /** `{ orgGrowth[], revenueTrend[], callVolume[] }` */
    trends: (params, options) => get('/admin/dashboard/trends', params, options),
  },

  analytics: {
    overview: (params, options) => get('/admin/analytics/overview', params, options),
    orgGrowth: (params, options) => get('/admin/analytics/org-growth', params, options),
    revenueTrend: (params, options) => get('/admin/analytics/revenue-trend', params, options),
    churnTrend: (params, options) => get('/admin/analytics/churn-trend', params, options),
    callVolumeTrend: (params, options) => get('/admin/analytics/call-volume-trend', params, options),
    planDistribution: (options) => http.get('/admin/analytics/plan-distribution', options),
  },

  organizations: {
    list: (params, options) => get('/admin/organizations', params, options),
    get: (id, options) => http.get(`/admin/organizations/${id}`, options),
    update: (id, payload) => http.patch(`/admin/organizations/${id}`, payload),
    suspend: (id, payload) => http.post(`/admin/organizations/${id}/suspend`, payload ?? {}),
    activate: (id, payload) => http.post(`/admin/organizations/${id}/activate`, payload ?? {}),
  },

  users: {
    list: (params, options) => get('/admin/users', params, options),
    get: (id, options) => http.get(`/admin/users/${id}`, options),
    updateRole: (id, payload) => http.patch(`/admin/users/${id}/role`, payload),
    suspend: (id, payload) => http.post(`/admin/users/${id}/suspend`, payload ?? {}),
    activate: (id, payload) => http.post(`/admin/users/${id}/activate`, payload ?? {}),
    /** `{ platformRoleId: uuid | null }` */
    assignPlatformRole: (id, payload) => http.patch(`/admin/users/${id}/platform-role`, payload),
  },

  calls: {
    list: (params, options) => get('/admin/calls', params, options),
    get: (id, options) => http.get(`/admin/calls/${id}`, options),
  },

  plans: {
    list: (options) => http.get('/admin/plans', options),
    get: (id, options) => http.get(`/admin/plans/${id}`, options),
    create: (payload) => http.post('/admin/plans', payload),
    update: (id, payload) => http.patch(`/admin/plans/${id}`, payload),
    archive: (id) => http.post(`/admin/plans/${id}/archive`),
    activate: (id) => http.post(`/admin/plans/${id}/activate`),
  },

  subscriptions: {
    list: (params, options) => get('/admin/subscriptions', params, options),
    get: (id, options) => http.get(`/admin/subscriptions/${id}`, options),
    /** `{ organizationId, planId, billingInterval?, startTrial? }` — 409 if the org already has a live subscription. */
    assign: (payload) => http.post('/admin/subscriptions', payload),
    changePlan: (id, payload) => http.patch(`/admin/subscriptions/${id}/plan`, payload),
    /** `{ atPeriodEnd?: boolean, reason? }` */
    cancel: (id, payload) => http.post(`/admin/subscriptions/${id}/cancel`, payload ?? {}),
  },

  billing: {
    overview: (params, options) => get('/admin/billing/overview', params, options),
    payments: {
      list: (params, options) => get('/admin/billing/payments', params, options),
      get: (id, options) => http.get(`/admin/billing/payments/${id}`, options),
      /** Record a manual (offline) payment. */
      record: (payload) => http.post('/admin/billing/payments', payload),
      /** Manual payments only — provider payments return 422. */
      refund: (id, payload) => http.post(`/admin/billing/payments/${id}/refund`, payload ?? {}),
    },
  },

  usage: {
    overview: (params, options) => get('/admin/usage/overview', params, options),
    list: (params, options) => get('/admin/usage', params, options),
    ofOrganization: (orgId, options) => http.get(`/admin/usage/organizations/${orgId}`, options),
    /** `{ amount: int (minutes, ±), reason }` */
    adjustCredits: (orgId, payload) => http.post(`/admin/usage/organizations/${orgId}/credits`, payload),
  },

  cogs: {
    /** `{ month, summary, recorded[], manual[], referenceRates }` for `month=YYYY-MM`. */
    breakdown: (params, options) => get('/admin/cogs', params, options),
    create: (payload) => http.post('/admin/cogs/categories', payload),
    update: (id, payload) => http.patch(`/admin/cogs/categories/${id}`, payload),
    remove: (id) => http.delete(`/admin/cogs/categories/${id}`),
  },

  roles: {
    permissionCatalog: (options) => http.get('/admin/permissions', options),
    list: (options) => http.get('/admin/roles', options),
    members: (id, options) => http.get(`/admin/roles/${id}/members`, options),
    create: (payload) => http.post('/admin/roles', payload),
    update: (id, payload) => http.patch(`/admin/roles/${id}`, payload),
    remove: (id) => http.delete(`/admin/roles/${id}`),
  },

  notifications: {
    broadcasts: (params, options) => get('/admin/notifications/broadcasts', params, options),
    /** `{ title, message, audience: 'all'|'owners'|'admins'|'subscribed'|'trialing' }` */
    broadcast: (payload) => http.post('/admin/notifications/broadcasts', payload),
  },

  /** Read-only — there is intentionally no create/update/delete. */
  auditLogs: {
    list: (params, options) => get('/admin/audit-logs', params, options),
    get: (id, options) => http.get(`/admin/audit-logs/${id}`, options),
    entityTypes: (options) => http.get('/admin/audit-logs/entity-types', options),
  },

  /** Per-tenant booking availability — the same org-default rows the tenant's booking modal reads. */
  calendar: {
    /** `{ organization, rule, workingHours[7], workingHoursIsDefault, holidays[], connections[] }` */
    get: (orgId, options) => http.get(`/admin/organizations/${orgId}/calendar`, options),
    /** `{ rule?: { timezone, slotDurationMinutes, bufferBeforeMinutes, bufferAfterMinutes, minNoticeMinutes, maxHorizonDays }, days?: [{ dayOfWeek, isActive, intervals: [{ start, end }] }] }` → fresh settings */
    update: (orgId, payload) => http.put(`/admin/organizations/${orgId}/calendar`, payload),
    /** Same params as `calendar.availability`; `{ connectionId, calendarConnected, slots }` */
    availability: (orgId, params, options) => get(`/admin/organizations/${orgId}/calendar/availability`, params, options),
    /** `{ name, date: 'YYYY-MM-DD', isRecurringYearly? }` */
    addHoliday: (orgId, payload) => http.post(`/admin/organizations/${orgId}/calendar/holidays`, payload),
    removeHoliday: (orgId, holidayId) => http.delete(`/admin/organizations/${orgId}/calendar/holidays/${holidayId}`),
  },

  settings: {
    /** `{ general, server }` — `server` is read-only, non-secret runtime config. */
    get: (options) => http.get('/admin/settings', options),
    updateGeneral: (payload) => http.patch('/admin/settings/general', payload),
  },
};

export default admin;
