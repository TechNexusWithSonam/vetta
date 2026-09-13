/**
 * Voice — `/voice/*` (calls, webhooks, do-not-call)
 *
 * ⚠️ `calls.create` and `calls.cancel` act on a REAL outbound PSTN call via
 * Retell/Bland. The lead needs a phone number plus a published call strategy (or
 * campaign script). DNC numbers are created then immediately finalized as
 * DO_NOT_CALL without dialing. Both require OWNER or ADMIN.
 *
 * call status: QUEUED | INITIATING | RINGING | CONNECTED | IN_PROGRESS |
 *   COMPLETED | FAILED | NO_ANSWER | BUSY | VOICEMAIL | CALLBACK_SCHEDULED |
 *   DO_NOT_CALL | CANCELLED
 */

import { http } from '../client.js';

export const voice = {
  calls: {
    /** ⚠️ Places a real call. @param {{ leadId: string, campaignId?: string }} payload */
    create(payload, options) {
      return http.post('/voice/calls', payload, options);
    },

    /** @param {{ page?: number, limit?: number, status?: string, campaignId?: string, leadId?: string }} [params] */
    list(params, options) {
      return http.get('/voice/calls', { ...options, query: params });
    },

    get(voiceCallId, options) {
      return http.get(`/voice/calls/${voiceCallId}`, options);
    },

    /** ⚠️ Sends a live hang-up. 409 unless QUEUED/INITIATING/RINGING. */
    cancel(voiceCallId, options) {
      return http.post(`/voice/calls/${voiceCallId}/cancel`, undefined, options);
    },

    /**
     * Force an immediate provider status + transcript sync for this call.
     * The backend normally reconciles calls on a background poll; this makes
     * the Live Calls page reflect a just-finished call without waiting.
     * Returns the up-to-date call. No-op (returns as-is) once terminal.
     */
    sync(voiceCallId, options) {
      return http.post(`/voice/calls/${voiceCallId}/sync`, undefined, options);
    },

    /** @param {string} callbackAt ISO timestamp. Sets status CALLBACK_SCHEDULED. */
    scheduleCallback(voiceCallId, callbackAt, options) {
      return http.post(`/voice/calls/${voiceCallId}/callback`, { callbackAt }, options);
    },

    /** Ordered transcript turns. Not paginated. */
    transcript(voiceCallId, options) {
      return http.get(`/voice/calls/${voiceCallId}/transcript`, options);
    },

    /** Plain array, createdAt desc. `limit` clamped server-side to [1, 200]. */
    events(voiceCallId, params, options) {
      return http.get(`/voice/calls/${voiceCallId}/events`, { ...options, query: params });
    },

    /** Recording metadata only — never a provider-hosted URL. */
    recording(voiceCallId, options) {
      return http.get(`/voice/calls/${voiceCallId}/recording`, options);
    },

    /** `{ status, failureReason, durationSeconds, costUsd, meetingBooked, converted, endedAt }`. */
    outcome(voiceCallId, options) {
      return http.get(`/voice/calls/${voiceCallId}/outcome`, options);
    },
  },

  doNotCall: {
    /** @param {{ page?: number, limit?: number }} [params] */
    list(params, options) {
      return http.get('/voice/do-not-call', { ...options, query: params });
    },

    /**
     * Idempotent upsert on (org, phoneNumber); source is forced to MANUAL.
     * OWNER, ADMIN.
     * @param {{ phoneNumber: string, leadId?: string, reason?: string }} payload
     */
    add(payload, options) {
      return http.post('/voice/do-not-call', payload, options);
    },
  },

  /**
   * Provider webhooks (`@Public()`, signature-verified server-side). Included
   * for completeness — normally called by Retell/Bland, not the browser.
   */
  webhooks: {
    retell(payload, options) {
      return http.post('/voice/webhooks/retell', payload, { ...options, auth: false });
    },
    bland(payload, options) {
      return http.post('/voice/webhooks/bland', payload, { ...options, auth: false });
    },
  },
};
