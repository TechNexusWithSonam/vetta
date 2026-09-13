/**
 * TEMPORARY, NON-SERVER-ENFORCED super-admin gate.
 *
 * The backend has no platform-wide `SUPER_ADMIN` role today (see
 * BACKEND_ISSUES.md, "Super Admin panel needs a real platform role") — every
 * `/auth/me` response only carries an org-scoped `role` (`OWNER`/`ADMIN`).
 * Until that ships, we gate the `/admin/*` UI client-side against an email
 * allow-list. This hides the UI only — it does NOT secure any data. Every
 * `admin.*` API call is also mock-fallback (see `../lib/mockFallback.js`)
 * until the backend ships real `/admin/*` endpoints that enforce this
 * server-side.
 *
 * TO SWITCH TO THE REAL ROLE LATER: replace the body of `isSuperAdmin()` with
 *   return user?.role === ROLES.SUPER_ADMIN;
 * That is the only change required anywhere in the app — every guard/hook
 * consumes this function, never the allow-list directly.
 */
const SUPER_ADMIN_EMAILS = String(import.meta.env.VITE_SUPER_ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isSuperAdmin(user) {
  if (!user) return false;
  return SUPER_ADMIN_EMAILS.includes(String(user.email || '').toLowerCase());
}
