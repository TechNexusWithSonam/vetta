/**
 * Settings — `/settings/*`
 *
 * Covers organization settings (+ history/restore), per-key settings, branding,
 * credentials, feature flags, user preferences, provider configs and
 * export/import. Almost every write requires OWNER or ADMIN. Secrets are never
 * returned — only masked values or `[REDACTED]` markers.
 *
 * Known single-setting keys: `timezone` | `locale` | `currency` | `dateFormat` | `timeFormat`.
 * Known providers: `claude` | `openai` | `retell` | `bland` | `synthflow`.
 */

import { http } from '../client.js';

export const settings = {
  /** Full organization settings document. */
  get(options) {
    return http.get('/settings', options);
  },

  /**
   * Bulk update (OWNER, ADMIN). All fields optional and format-validated.
   * @param {{ timezone?: string, locale?: string, currency?: string, dateFormat?: string, timeFormat?: '12h'|'24h' }} payload
   */
  bulkUpdate(payload, options) {
    return http.patch('/settings', payload, options);
  },

  /** Audit-log rows for settings changes. Plain array. OWNER, ADMIN. @param {{ page?: number, limit?: number }} [params] */
  history(params, options) {
    return http.get('/settings/history', { ...options, query: params });
  },

  /** 404 if not a settings-related audit entry. OWNER, ADMIN. */
  historyEntry(settingsHistoryId, options) {
    return http.get(`/settings/history/${settingsHistoryId}`, options);
  },

  /** Restore org settings / branding from a history entry (OWNER, ADMIN). */
  restoreFromHistory(settingsHistoryId, options) {
    return http.put(`/settings/history/${settingsHistoryId}/restore`, undefined, options);
  },

  /** @param {string} key One of the known single-setting keys. 400 for anything else. */
  getOne(key, options) {
    return http.get(`/settings/${key}`, options);
  },

  /** @param {string} key @param {string} value Plain string. OWNER, ADMIN. */
  setOne(key, value, options) {
    return http.put(`/settings/${key}`, { value }, options);
  },

  /** Reset a single key to the platform default (OWNER, ADMIN). */
  resetOne(key, options) {
    return http.delete(`/settings/${key}`, options);
  },

  branding: {
    /** Defaults to an all-null shape if unconfigured (never 404s). */
    get(options) {
      return http.get('/settings/branding', options);
    },
    /**
     * OWNER, ADMIN. Colors must be `#RGB` or `#RRGGBB`.
     * @param {{ logoUrl?: string, primaryColor?: string, secondaryColor?: string,
     *   domain?: string, companyDisplayName?: string, emailFromName?: string,
     *   emailFromAddress?: string, emailFooterHtml?: string }} payload
     */
    update(payload, options) {
      return http.put('/settings/branding', payload, options);
    },
  },

  credentials: {
    /** Only `credentialMasked` is ever returned. OWNER, ADMIN. */
    list(options) {
      return http.get('/settings/credentials', options);
    },
    /**
     * OWNER, ADMIN. `provider`: claude|openai|retell|bland|synthflow;
     * `credential` min length 8 (openai must start with `sk-`). 400 if one
     * already exists for the provider (use {@link rotate}).
     * @param {{ category: string, provider: string, credential: string }} payload
     */
    create(payload, options) {
      return http.post('/settings/credentials', payload, options);
    },
    /** Rotate a credential value (OWNER, ADMIN). @param {{ credential: string }} payload */
    rotate(credentialId, payload, options) {
      return http.put(`/settings/credentials/${credentialId}`, payload, options);
    },
    /** Strip the credential fields (the ProviderConfig row stays). 204. OWNER, ADMIN. */
    remove(credentialId, options) {
      return http.delete(`/settings/credentials/${credentialId}`, options);
    },
  },

  featureFlags: {
    /** All 13 FeatureFlagKey values, backfilled with code defaults. */
    get(options) {
      return http.get('/settings/feature-flags', options);
    },
    /**
     * Set an override (OWNER, ADMIN). Omit `userId` for the org-wide default.
     * @param {string} key A valid FeatureFlagKey (400 otherwise).
     * @param {{ isEnabled: boolean, userId?: string }} payload
     */
    set(key, payload, options) {
      return http.put(`/settings/feature-flags/${key}`, payload, options);
    },
  },

  preferences: {
    /** Self-scoped to the caller. */
    get(options) {
      return http.get('/settings/preferences', options);
    },
    /**
     * @param {{ theme?: 'light'|'dark'|'system', language?: string, timezone?: string,
     *   dashboardLayout?: object, notificationPrefs?: object,
     *   defaultCampaignFilters?: object, defaultCalendarId?: string,
     *   defaultCallSettings?: object }} payload
     */
    update(payload, options) {
      return http.put('/settings/preferences', payload, options);
    },
  },

  providers: {
    /** Only rows the org has configured. */
    list(options) {
      return http.get('/settings/providers', options);
    },
    /** @param {string} name claude|openai|retell|bland|synthflow. Synthesizes an "unconfigured" view if no row. */
    get(name, options) {
      return http.get(`/settings/providers/${name}`, options);
    },
    /**
     * Upsert (OWNER, ADMIN). `credential` optional — omit to leave it untouched.
     * @param {string} name
     * @param {{ isEnabled?: boolean, isDefault?: boolean, isFallback?: boolean, config?: object, credential?: string }} payload
     */
    upsert(name, payload, options) {
      return http.put(`/settings/providers/${name}`, payload, options);
    },
    /** Soft delete, idempotent. Returns 200 (not 204). OWNER, ADMIN. */
    remove(name, options) {
      return http.delete(`/settings/providers/${name}`, options);
    },
  },

  /** JSON export (not a file). Credentials appear as `[REDACTED]`. OWNER, ADMIN. */
  export(options) {
    return http.post('/settings/export', undefined, options);
  },

  /**
   * Preview or apply a settings import (OWNER, ADMIN). `confirm: false`
   * (default) writes nothing and returns `{ applied: false, preview }`.
   * 400 if `data.version !== 1`. Never resurrects credentials.
   * @param {{ data: object, confirm?: boolean }} payload
   */
  import(payload, options) {
    return http.post('/settings/import', payload, options);
  },
};
