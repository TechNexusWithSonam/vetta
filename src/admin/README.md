# Super Admin panel

Platform-operator UI mounted at `/admin/*` (route block in `src/App.jsx`), separate from the customer `/app/*` app. Backed entirely by the real cross-tenant API in vetta-backend `src/modules/platform-admin/` — there is no mock or demo data.

## Access (server-decided)

- Sign-in page: `pages/AdminLogin.jsx` at `/admin/login` (same `POST /auth/login` + token storage as the customer app).
- After login the panel calls `GET /admin/me`. The **backend** decides access: users listed in the server env var `PLATFORM_SUPER_ADMIN_EMAILS` are built-in Super Admins; other operators get a DB-assigned platform role (Roles & Permissions page). A tenant `OWNER` gets nothing here by default. 401/403 → signed out with "not authorized".
- `rbac/AdminAccessContext.jsx` holds the `/admin/me` answer; `Can`, `RequirePermission` and the sidebar only *hide* UI. Every `/admin/*` endpoint enforces the same permission server-side on every request.

## Data

- `src/api/resources/admin.js` — one module for every `/admin/*` call; all reads accept `{ signal }` for cancellation. Lists return `{ data, total, page, limit }`.
- `lib/useAdminQuery.js` — fetch hook that aborts superseded/unmounted requests.
- `lib/adminErrors.js` — one mapping for 401/403/404/409/422/5xx/network → operator-facing messages.
- Mutations are audit-logged by the server in the same request; the panel never writes audit rows.

## Structure

- `rbac/` — access context, `RequireSuperAdmin`, `RequirePermission`, `Can`, permission keys (mirror of the backend catalog).
- `layout/` — `AdminLayout`/`AdminSidebar`/`AdminTopbar`, `adminNav.js` (permission-gated).
- `components/` — `StatCard`, `DataTable`, `FilterBar`, `ChartCard`, `StatusBadge`, `DetailList`, `OrganizationPicker`, and shared modals (calls, payments, subscriptions, credits).
- `pages/` — one page per sidebar item; `pages/organizations/` for the list + 7-tab detail view.

## Known gaps

- No payment provider is integrated; payments are recorded manually and only manual payments can be marked refunded.
- Organizations are created by self-service signup only (no invite flow), so the panel edits/suspends but does not create them.
- Impersonation ("login as organization") stays disabled pending a secure token-exchange flow.
