/** Admin — Notifications `/admin/notifications/*` (proposed contract), platform broadcast/ops notifications. */
import { http } from '../client.js';
import { withMockFallback } from '../../admin/lib/mockFallback.js';
import {
  mockListNotifications, mockMarkNotificationRead, mockBroadcastNotification,
} from '../../admin/mocks/notifications.mock.js';

export const adminNotifications = {
  list: withMockFallback(
    (params) => http.get('/admin/notifications', { query: params }),
    (params) => mockListNotifications(params),
  ),
  markRead: withMockFallback(
    (id) => http.post(`/admin/notifications/${id}/read`),
    (id) => mockMarkNotificationRead(id),
  ),
  broadcast: withMockFallback(
    (payload) => http.post('/admin/notifications/broadcast', payload),
    (payload) => mockBroadcastNotification(payload),
  ),
};

export default adminNotifications;
