/**
 * demoRequests — "Book a demo" / contact form submissions.
 *
 * No backend endpoint exists for this yet. The service is backed by
 * `./demoRequests.mock.js` (the only place sample behaviour lives). When the
 * real endpoint ships:
 *   1. add `api.demoRequests.create(payload)` in `src/api/resources/`
 *   2. change `submit` below to call it
 *   3. delete `./demoRequests.mock.js`
 * Callers do not change.
 *
 * @typedef {object} DemoRequestPayload
 * @property {string} name
 * @property {string} email        Work email.
 * @property {string} company
 * @property {string} [role]
 * @property {string} [teamSize]
 * @property {string} [goal]       "What are you looking to achieve?"
 * @property {string} [source]     Page/campaign the request came from.
 */

import * as mock from './demoRequests.mock.js';

/** Test seam — lets a dev force the next submit to fail. Mock-only today. */
export const __mock = mock.__mock;

/**
 * Submit a demo / contact request.
 * @param {DemoRequestPayload} payload
 * @returns {Promise<{ id: string, status: 'received' }>}
 */
export function submit(payload) {
  return mock.submit(payload);
}

export const demoRequests = { submit, __mock };

export default demoRequests;
