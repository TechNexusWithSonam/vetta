/**
 * Notifications — `/notifications/*`, `/notification-preferences/*`,
 * `/notification-templates/*`, `/notification-webhook-configs/*`
 *
 * channel: EMAIL | SMS | IN_APP | SLACK | WEBHOOK.
 * In-app notifications are always scoped to the caller's own (org, user).
 * Templates are versioned (DRAFT -> PUBLISHED -> ARCHIVED); a PUBLISHED/ARCHIVED
 * template is edited by creating a new version, not `updateTemplate`.
 */

import { http } from '../client.js';

export const notifications = {
  // ---- Notification jobs --------------------------------------------------

  /**
   * Dispatch a one-off test notification (OWNER, ADMIN).
   * @param {{ eventKey: string, channel: string, recipient: string, variables?: object }} payload
   */
  sendTest(payload, options) {
    return http.post('/notifications/test', payload, options);
  },

  /** 404 "Notification not found" if missing/cross-tenant. */
  getJob(notificationJobId, options) {
    return http.get(`/notifications/${notificationJobId}`, options);
  },

  /** `NotificationDeliveryAttempt[]`, createdAt asc. */
  jobLogs(notificationJobId, options) {
    return http.get(`/notifications/${notificationJobId}/logs`, options);
  },

  /** 400 if status is already SENT or DELIVERED (OWNER, ADMIN). */
  cancelJob(notificationJobId, options) {
    return http.post(`/notifications/${notificationJobId}/cancel`, undefined, options);
  },

  // ---- In-app notifications --------------------------------------------

  unreadCount(options) {
    return http.get('/notifications/unread-count', options);
  },

  /** Plain array. @param {{ unreadOnly?: boolean, page?: number, limit?: number }} [params] */
  listInApp(params, options) {
    return http.get('/notifications', { ...options, query: params });
  },

  markAllRead(options) {
    return http.patch('/notifications/read-all', undefined, options);
  },

  /** 404 if not owned by the caller. */
  markRead(inAppNotificationId, options) {
    return http.patch(`/notifications/${inAppNotificationId}/read`, undefined, options);
  },

  markUnread(inAppNotificationId, options) {
    return http.patch(`/notifications/${inAppNotificationId}/unread`, undefined, options);
  },

  // ---- Preferences (self-scoped) --------------------------------------

  preferences: {
    list(options) {
      return http.get('/notification-preferences', options);
    },

    /** `eventKey` is a free-form string. Returns `[]` if no override. */
    getForEvent(eventKey, options) {
      return http.get(`/notification-preferences/${eventKey}`, options);
    },

    /**
     * 400 if the event is mandatory and `enabled: false` is requested.
     * @param {{ channel: string, enabled: boolean }} payload
     */
    setForEvent(eventKey, payload, options) {
      return http.put(`/notification-preferences/${eventKey}`, payload, options);
    },
  },

  // ---- Templates ------------------------------------------------------

  templates: {
    /** @param {{ templateKey?: string, channel?: string }} [params] */
    list(params, options) {
      return http.get('/notification-templates', { ...options, query: params });
    },

    /**
     * Created as DRAFT, version 1 (or latest+1 for the key/channel/locale).
     * OWNER, ADMIN.
     * @param {{ templateKey: string, channel: string, locale?: string, subject?: string, body: string }} payload
     */
    create(payload, options) {
      return http.post('/notification-templates', payload, options);
    },

    get(notificationTemplateId, options) {
      return http.get(`/notification-templates/${notificationTemplateId}`, options);
    },

    /** 400 unless the template is DRAFT (OWNER, ADMIN). @param {{ subject?: string, body?: string }} payload */
    update(notificationTemplateId, payload, options) {
      return http.put(`/notification-templates/${notificationTemplateId}`, payload, options);
    },

    /** Copy into a new DRAFT (version latest+1). OWNER, ADMIN. */
    createVersion(notificationTemplateId, options) {
      return http.post(`/notification-templates/${notificationTemplateId}/version`, undefined, options);
    },

    /** Archives the previously PUBLISHED version for the same key/channel/locale. OWNER, ADMIN. */
    publish(notificationTemplateId, options) {
      return http.post(`/notification-templates/${notificationTemplateId}/publish`, undefined, options);
    },

    /** OWNER, ADMIN. */
    archive(notificationTemplateId, options) {
      return http.post(`/notification-templates/${notificationTemplateId}/archive`, undefined, options);
    },

    /** Every version sharing this template's (key, channel, locale). */
    listVersions(notificationTemplateId, options) {
      return http.get(`/notification-templates/${notificationTemplateId}/versions`, options);
    },

    /**
     * Render with sample variables without dispatching. `variables` is a free
     * arbitrary object; `missingVariables` in the response lists unresolved
     * placeholders.
     * @param {object} variables
     */
    preview(notificationTemplateId, variables, options) {
      return http.post(`/notification-templates/${notificationTemplateId}/preview`, variables ?? {}, options);
    },
  },

  // ---- Webhook destinations (OWNER, ADMIN) --------------------------

  webhookConfigs: {
    list(options) {
      return http.get('/notification-webhook-configs', options);
    },

    /**
     * The plaintext signing secret is returned exactly ONCE in this response —
     * capture it immediately. 400 if the URL fails the SSRF safety check.
     * @param {{ name: string, url: string, eventKeys: string[] }} payload
     */
    register(payload, options) {
      return http.post('/notification-webhook-configs', payload, options);
    },

    /** Never includes the plaintext secret. */
    get(notificationWebhookConfigId, options) {
      return http.get(`/notification-webhook-configs/${notificationWebhookConfigId}`, options);
    },

    deactivate(notificationWebhookConfigId, options) {
      return http.patch(`/notification-webhook-configs/${notificationWebhookConfigId}/deactivate`, undefined, options);
    },

    activate(notificationWebhookConfigId, options) {
      return http.patch(`/notification-webhook-configs/${notificationWebhookConfigId}/activate`, undefined, options);
    },

    /** Soft delete. Responds `{ success: true }` (not the usual envelope). */
    remove(notificationWebhookConfigId, options) {
      return http.delete(`/notification-webhook-configs/${notificationWebhookConfigId}`, options);
    },
  },
};
