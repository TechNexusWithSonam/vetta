/**
 * Calendar — `/calendar/*` (connections, availability, meetings, settings, webhooks)
 *
 * provider: GOOGLE | CALENDLY | OUTLOOK | OFFICE365 — only GOOGLE and CALENDLY
 * are implemented. GOOGLE goes through the OAuth flow
 * (`connections.googleOAuthUrl` -> browser consent -> `connections.googleCallback`)
 * rather than `connections.create`. Meeting booking is idempotent on
 * `bookingRequestId`. Mutations require OWNER or ADMIN.
 *
 * meeting status: PENDING | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW | FAILED
 */

import { http } from '../client.js';

export const calendar = {
  connections: {
    /**
     * @param {{ provider: string, credentials: object, config?: object, ownerUserId?: string }} payload
     */
    create(payload, options) {
      return http.post('/calendar/connections', payload, options);
    },

    list(options) {
      return http.get('/calendar/connections', options);
    },

    get(calendarConnectionId, options) {
      return http.get(`/calendar/connections/${calendarConnectionId}`, options);
    },

    /** Live provider call; records ACTIVE or ERROR, never throws. */
    test(calendarConnectionId, options) {
      return http.post(`/calendar/connections/${calendarConnectionId}/test`, undefined, options);
    },

    enable(calendarConnectionId, options) {
      return http.post(`/calendar/connections/${calendarConnectionId}/enable`, undefined, options);
    },

    disable(calendarConnectionId, options) {
      return http.post(`/calendar/connections/${calendarConnectionId}/disable`, undefined, options);
    },

    /** @param {{ credentials?: object, config?: object }} payload (credentials replace + re-test). */
    update(calendarConnectionId, payload, options) {
      return http.patch(`/calendar/connections/${calendarConnectionId}`, payload, options);
    },

    /** Soft delete (status = DISCONNECTED). 204. */
    remove(calendarConnectionId, options) {
      return http.delete(`/calendar/connections/${calendarConnectionId}`, options);
    },

    /** `{ url }` — open in a browser to start Google consent. OWNER, ADMIN. */
    googleOAuthUrl(params, options) {
      return http.get('/calendar/connections/google/oauth-url', { ...options, query: params });
    },

    /**
     * Google's redirect target (`@Public()`, issues a 302). Not meaningfully
     * callable from JS — `state` is HMAC-verified server-side.
     * @param {{ code: string, state: string }} params
     */
    googleCallback(params, options) {
      return http.get('/calendar/connections/google/callback', {
        ...options,
        auth: false,
        query: params,
      });
    },
  },

  /**
   * Bookable slots honoring working hours, holidays, buffers, min-notice and
   * existing bookings. `rangeStart`/`rangeEnd` required (full ISO 8601).
   * @param {{ rangeStart: string, rangeEnd: string, durationMinutes?: number,
   *   connectionId?: string, ownerUserId?: string, timezone?: string }} params
   */
  availability(params, options) {
    return http.get('/calendar/availability', { ...options, query: params });
  },

  meetings: {
    /**
     * `bookingRequestId` is the idempotency key. 409 if no slot is available.
     * @param {{ leadId: string, startTimeIso: string, durationMinutes: number,
     *   campaignId?: string, connectionId?: string, title?: string,
     *   description?: string, timezone?: string, attendeeEmail?: string,
     *   attendeeName?: string, bookingRequestId?: string,
     *   autoSelectIfUnavailable?: boolean }} payload
     */
    create(payload, options) {
      return http.post('/calendar/meetings', payload, options);
    },

    /** @param {{ windowDays?: number }} [params] */
    stats(params, options) {
      return http.get('/calendar/meetings/stats', { ...options, query: params });
    },

    /** Plain array (no total). @param {{ leadId?: string, campaignId?: string, status?: string, page?: number, limit?: number }} [params] */
    list(params, options) {
      return http.get('/calendar/meetings', { ...options, query: params });
    },

    /** 404 if missing/cross-tenant. */
    get(meetingBookingId, options) {
      return http.get(`/calendar/meetings/${meetingBookingId}`, options);
    },

    /** Cross-tenant access returns `[]` here (not 404). */
    logs(meetingBookingId, options) {
      return http.get(`/calendar/meetings/${meetingBookingId}/logs`, options);
    },

    /**
     * 400 if CANCELLED/COMPLETED; 409 on a slot conflict.
     * @param {{ startTimeIso: string, durationMinutes?: number, timezone?: string, reason?: string }} payload
     */
    reschedule(meetingBookingId, payload, options) {
      return http.post(`/calendar/meetings/${meetingBookingId}/reschedule`, payload, options);
    },

    /** Idempotent on an already-CANCELLED meeting. @param {{ reason?: string }} [payload] */
    cancel(meetingBookingId, payload, options) {
      return http.post(`/calendar/meetings/${meetingBookingId}/cancel`, payload ?? {}, options);
    },
  },

  settings: {
    /** @param {{ ownerUserId?: string }} [params] — falls back to org default. */
    getWorkingHours(params, options) {
      return http.get('/calendar/settings/working-hours', { ...options, query: params });
    },

    /**
     * Upserts one row per supplied day (dayOfWeek 0=Sun..6=Sat). OWNER, ADMIN.
     * Omit `ownerUserId` to set the org default.
     * @param {{ days: Array<{ dayOfWeek: number, intervals: Array<{ start: string, end: string }>, isActive?: boolean }>, ownerUserId?: string }} payload
     */
    setWorkingHours(payload, options) {
      return http.put('/calendar/settings/working-hours', payload, options);
    },

    listHolidays(options) {
      return http.get('/calendar/settings/holidays', options);
    },

    /** @param {{ name: string, date: string, isRecurringYearly?: boolean }} payload. OWNER, ADMIN. */
    createHoliday(payload, options) {
      return http.post('/calendar/settings/holidays', payload, options);
    },

    /** OWNER, ADMIN. */
    deleteHoliday(holidayId, options) {
      return http.delete(`/calendar/settings/holidays/${holidayId}`, options);
    },

    /** @param {{ ownerUserId?: string }} [params] — falls back to a hardcoded default. */
    getAvailabilityRule(params, options) {
      return http.get('/calendar/settings/availability-rule', { ...options, query: params });
    },

    /**
     * @param {{ timezone?: string, slotDurationMinutes?: number,
     *   bufferBeforeMinutes?: number, bufferAfterMinutes?: number,
     *   minNoticeMinutes?: number, maxHorizonDays?: number, isActive?: boolean,
     *   ownerUserId?: string }} payload. OWNER, ADMIN.
     */
    setAvailabilityRule(payload, options) {
      return http.put('/calendar/settings/availability-rule', payload, options);
    },
  },

  /** Provider webhooks (`@Public()`). Google carries no body — all signal is in headers. */
  webhooks: {
    google(payload, options) {
      return http.post('/calendar/webhooks/google', payload, { ...options, auth: false });
    },
    calendly(payload, options) {
      return http.post('/calendar/webhooks/calendly', payload, { ...options, auth: false });
    },
  },
};
