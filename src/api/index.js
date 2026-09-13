/**
 * AI SDR SaaS API client — public entry point.
 *
 * Mirrors the `AI-SDR-SaaS.postman_collection.json` collection: one namespace
 * per collection folder, one method per request. Every method returns the
 * unwrapped `data` from the backend's `{ success, data, timestamp }` envelope
 * (or the raw array/object for the endpoints that don't wrap), and throws an
 * {@link ApiError} for any non-2xx response.
 *
 * @example
 *   import { api } from './api';
 *
 *   await api.auth.login({ email, password });        // tokens are stored automatically
 *   const leads = await api.leads.list({ page: 1, limit: 20 });
 *   await api.campaigns.start(campaignId);
 *
 * Configure the base URL with `VITE_API_BASE_URL` (see `.env.example`).
 * Auth/refresh state lives in {@link tokenStore}; low-level access is via
 * {@link request} / {@link http} from `./client`.
 */

import { auth } from './resources/auth.js';
import { leads } from './resources/leads.js';
import { imports } from './resources/imports.js';
import { promptTemplates } from './resources/promptTemplates.js';
import { research } from './resources/research.js';
import { campaignTemplates } from './resources/campaignTemplates.js';
import { campaigns } from './resources/campaigns.js';
import { callStrategies } from './resources/callStrategies.js';
import { qualificationFrameworks } from './resources/qualificationFrameworks.js';
import { objections } from './resources/objections.js';
import { voice } from './resources/voice.js';
import { crm } from './resources/crm.js';
import { calendar } from './resources/calendar.js';
import { notifications } from './resources/notifications.js';
import { analytics } from './resources/analytics.js';
import { settings } from './resources/settings.js';
import { system } from './resources/system.js';
import { adminApi as admin } from './resources/adminIndex.js';

export const api = {
  admin,
  auth,
  leads,
  imports,
  promptTemplates,
  research,
  campaignTemplates,
  campaigns,
  callStrategies,
  qualificationFrameworks,
  objections,
  voice,
  crm,
  calendar,
  notifications,
  analytics,
  settings,
  system,
};

export default api;

export { ApiError } from './ApiError.js';
export { tokenStore } from './tokenStore.js';
export { request, http, buildQuery } from './client.js';
export { API_BASE_URL } from './config.js';

// Namespaces are also exported individually for targeted imports.
export {
  admin,
  auth,
  leads,
  imports,
  promptTemplates,
  research,
  campaignTemplates,
  campaigns,
  callStrategies,
  qualificationFrameworks,
  objections,
  voice,
  crm,
  calendar,
  notifications,
  analytics,
  settings,
  system,
};
