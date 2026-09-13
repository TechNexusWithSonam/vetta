/**
 * Voice actions gated to OWNER/ADMIN server-side (see `src/api/resources/voice.js`
 * doc comments): `voice.calls.create`, `voice.calls.cancel`, `voice.doNotCall.add`.
 * This mirrors that rule client-side so the UI can hide/disable the action
 * instead of letting the user hit it and see a 403. The server remains the
 * actual authorization boundary — this is UX only.
 */
export function canManageCalls(user) {
  return user?.role === 'OWNER' || user?.role === 'ADMIN';
}
