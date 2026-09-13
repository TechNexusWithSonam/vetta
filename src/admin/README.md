# Super Admin panel

Platform-operator UI mounted at `/admin/*` (see the route block in `src/App.jsx`), fully additive to the existing `/app/*` customer app — no existing file's behavior changes.

## Access

Super Admin has its own sign-in page, `pages/AdminLogin.jsx` at `/admin/login` — separate from the customer `/login` screen and independent of the customer email-verification/onboarding funnel (`RequireAuth`). It authenticates against the same backend (`POST /auth/login` via `useAuth().login()`, same token storage), so it's a real account + real password — just its own page. After a successful login, `rbac/RequireSuperAdmin.jsx` (and the login page itself) checks a **temporary, client-side-only** email allow-list (`VITE_SUPER_ADMIN_EMAILS`, see `.env.example` and `rbac/superAdminGate.js`); anyone else is signed back out with a "not authorized" message. This is not server-enforced — see `BACKEND_ISSUES.md` #9 for what the backend needs to ship before this is production-secure.

## Data

The backend has no cross-tenant `/admin/*` endpoints yet. Every `src/api/resources/admin*.js` function is built with `withMockFallback()` (`lib/mockFallback.js`): it calls the real proposed endpoint first, and only falls back to realistic local mock data (`mocks/*.mock.js`) on a "route doesn't exist yet" style failure (404/405/501/502/503) — mirroring the exact pattern `src/api/resources/auth.js` already uses. Pages show a `DemoDataBadge` wherever mock data is being displayed. The moment the backend ships a real endpoint, the UI needs no changes.

## Structure

- `rbac/` — roles, permissions, the super-admin gate, and the `RequireSuperAdmin`/`Can` guards.
- `layout/` — `AdminLayout`/`AdminSidebar`/`AdminTopbar`, visually matching `AppLayout.jsx` with added mobile responsiveness.
- `components/` — shared primitives (`StatCard`, `DataTable`, `FilterBar`, `ChartCard`, `StatusBadge`, `DemoDataBadge`, `ConfirmActionButton`, `SectionHeader`), all built on the existing `src/components/ui/*` kit.
- `lib/` — the mock-fallback adapter, an `useAsync` wrapper, the audit-log helper, and date-range utilities.
- `mocks/` — deterministic (seeded) mock data generators, one per module.
- `pages/` — one page per sidebar item, plus `pages/organizations/` for the list + 7-tab detail view.

## Known gaps / TODOs

- Impersonation ("login as organization") is intentionally not implemented — the Organizations table shows a disabled action pending a secure backend token-exchange flow.
- Roles & Permissions changes are audit-logged but not yet enforced server-side (see the banner on that page).
- See `BACKEND_ISSUES.md` #9 for the full backend contract this module is written against.
