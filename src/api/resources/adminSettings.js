/**
 * Admin — System Settings `/admin/settings/*` (proposed contract).
 * `health` is NOT mock-wrapped — it passes straight through to the already
 * real, public `api.system.health/ready/live` endpoints.
 */
import { http } from '../client.js';
import { system } from './system.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import {
  mockGetGeneralSettings, mockUpdateGeneralSettings, mockGetSecuritySettings, mockUpdateSecuritySettings,
} from '../../admin/mocks/settings.mock.js';

export const adminSettings = {
  health: {
    check: () => system.health(),
    ready: () => system.ready(),
    live: () => system.live(),
  },
  general: {
    get: withMockFallback(
      () => http.get('/admin/settings/general'),
      () => mockGetGeneralSettings(),
    ),
    update: withMockFallback(
      (payload) => http.patch('/admin/settings/general', payload),
      (payload) => mockUpdateGeneralSettings(payload),
    ),
  },
  security: {
    get: withMockFallback(
      () => http.get('/admin/settings/security'),
      () => mockGetSecuritySettings(),
    ),
    update: withMockFallback(
      (payload) => http.patch('/admin/settings/security', payload),
      (payload) => mockUpdateSecuritySettings(payload),
    ),
  },
};

export default adminSettings;
