# AI SDR SaaS — Backend Issues (for the API team)

**Environment:** `https://vetta-backend.vercel.app`
**Found:** 2026-08-31, while wiring the frontend to the API using `AI-SDR-SaaS.postman_collection.json` as the contract.
**Method:** `npm run audit` in the frontend repo — registers a fresh org and exercises every documented endpoint. 145 checks pass; the items below are the failures. In every case the client sends exactly what the Postman collection documents.

All error bodies below are copied verbatim from the deployment.

---

## P1 — Blocking (a whole page/feature is unusable)

### 1. `/settings/*` literal sub-routes are shadowed by `GET /settings/:key`

**Endpoints affected**

| Method | Path | Result |
|---|---|---|
| GET | `/settings/branding` | `400 Unknown setting key: branding` |
| PUT | `/settings/branding` | `400 Bad Request Exception` |
| GET | `/settings/credentials` | `400 Unknown setting key: credentials` |
| GET | `/settings/feature-flags` | `400 Unknown setting key: feature-flags` |
| GET | `/settings/preferences` | `400 Unknown setting key: preferences` |
| PUT | `/settings/preferences` | `400 Bad Request Exception` |
| GET | `/settings/providers` | `400 Unknown setting key: providers` |

**Repro**

```bash
curl -s https://vetta-backend.vercel.app/settings/branding -H "Authorization: Bearer <token>"
# {"statusCode":400,"message":"Unknown setting key: branding","error":"BadRequestException",
#  "timestamp":"...","path":"/settings/branding"}
```

**Expected:** `GET /settings/branding` returns the branding object (per the collection's "Settings / Branding" folder), etc.

**Actual:** the request resolves to the `GET /settings/:key` handler (single-setting lookup), which only accepts `timezone|locale|currency|dateFormat|timeFormat` and 400s on anything else. The error message is literally that handler's.

**Root cause:** in the deployed build the parameterised route `@Get(':key')` is registered **before** the literal routes `@Get('branding')`, `@Get('credentials')`, `@Get('feature-flags')`, `@Get('preferences')`, `@Get('providers')`, so Nest matches `:key` first. (This is **not** "the modules aren't deployed" — the deeper nested routes under the same prefixes work fine, see below — it's purely declaration order, or the deployed build is behind the source the Postman collection was generated from.)

**Proof the features exist** (same session, same token):

```
GET  /settings/providers/claude                  -> 200  (full ProviderConfig object)
PUT  /settings/feature-flags/BETA_ANALYTICS_EXPORT -> 200 (all 13 flags returned)
POST /settings/export                            -> 200
POST /settings/import                            -> 200
```

**Fix:** declare the specific `@Get('branding')` / `@Get('credentials')` / `@Get('feature-flags')` / `@Get('preferences')` / `@Get('providers')` (and their `@Put`) handlers **above** `@Get(':key')` / `@Put(':key')` in `SettingsController`, then redeploy. (Same pattern the collection notes already call out for `/leads/analytics` before `/leads/:id` and `/research/cost-analytics` before `/research/:id`.)

**Frontend impact:** the Settings page cannot load Branding, API Credentials, the feature-flag list, User Preferences, or the provider-config list.

---

### 2. `POST /notification-webhook-configs` → 500 Internal Server Error

**Repro**

```bash
curl -s -X POST https://vetta-backend.vercel.app/notification-webhook-configs \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"name":"Ops Relay","url":"https://example.com/hook","eventKeys":["meeting.created"]}'
# {"statusCode":500,"message":"Internal server error","error":"InternalServerError",
#  "timestamp":"...","path":"/notification-webhook-configs"}
```

**Expected:** `201` with the created config **and the plaintext signing secret returned exactly once** (per the collection: "server-generated 64-char hex ... never retrievable again"). Or a `400` if `example.com` fails the SSRF safety check.

**Actual:** unhandled exception → 500. The body matches this payload shape exactly, so it's not a validation problem.

**Likely causes (need server logs / stack trace):**
- the HMAC secret generation (`crypto.randomBytes`) or its encryption-at-rest step throwing;
- the SSRF / URL-safety check throwing instead of returning `400` (e.g. DNS lookup failing in the serverless runtime);
- a DB write / unique-constraint error not being caught.

**Fix:** wrap the create path so provider/crypto failures surface as `400`/`422` with a message; add a log line with the stack trace.

**Frontend impact:** "Register webhook destination" on the Notifications page always fails.

---

### 9. Research job status view has no `leadId` or `type`

*(Filed after #8 but it's a P1 — a whole page can't identify its own rows.)*

**Endpoints affected:** `POST /research`, `GET /research`, `GET /research/:id` (all return the "status view").

**Repro** (fresh org, one lead, one job — full status view copied verbatim):

```jsonc
// GET /research  -> data[0]   AND   GET /research/:id
{
  "id": "e0e3410a-...", "status": "queued", "stale": false, "attempts": 0,
  "provider": null, "model": null, "error": null, "queueJobId": "66",
  "createdAt": "...", "startedAt": null, "completedAt": null,
  "failedAt": null, "updatedAt": "..."
}
```

**Expected:** the view identifies which lead the job is for and what kind of
research it is — i.e. `leadId` and `type` at minimum, ideally an embedded
`lead: { id, firstName, lastName, company }` so the list doesn't need a second
call.

**Actual:** neither `leadId` nor `type` appears on any research endpoint, and
there is no lead-scoped research list. The client has **no way** to map a job to
its lead. `POST /research` accepts `{ leadId, type }` but never echoes them back.

**Frontend impact:** on the AI Research page every job (list + detail) shows a
blank/`—` name, blank type, and a `—` avatar. Only jobs started in the current
browser session can be labelled (the client now caches `jobId -> {leadId,type}`
in `localStorage` as a stopgap); anything started elsewhere or before that cache
is unidentifiable.

**Fix:** add `leadId` and `type` (and preferably the nested `lead` summary) to
the research status-view serializer.

---

## P2 — Degraded / inconsistent

### 3. `POST /campaign-templates` requires fields the contract says are optional

**Repro**

```bash
curl -s -X POST https://vetta-backend.vercel.app/campaign-templates \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"name":"My Template"}'
# {"statusCode":400,"message":"Bad Request Exception","error":"BadRequestException",...}

# With scriptPromptKey + defaultScheduleConfig -> 201 OK
```

**Expected:** per the collection, only `name` is required (`description`, `scriptPromptKey`, `defaultScheduleConfig` optional).

**Actual:** a bare `{ name }` is rejected with a **generic** `"Bad Request Exception"` — no `message` array telling the caller which field is missing. It only succeeds when both `scriptPromptKey` and `defaultScheduleConfig` are supplied.

**Fix:** either make those fields genuinely optional (matching the DTO the collection was generated from), or keep them required **and** return the standard class-validator `message: string[]` listing them.

**Frontend impact:** low — the Launch Campaign flow always sends the full payload — but the raw endpoint is stricter and less informative than documented.

---

### 3b. Async workers don't run on the deployment — research/import/campaign jobs never leave `PENDING`

**Repro**

```bash
# POST /research {leadId, type:"COMPANY_RESEARCH"} -> 201, status PENDING
# then poll GET /research/:id for 60s:
#   t+5s..t+60s   status=PENDING  provider=null  model=null  attempts=0  errorMessage=null
```

**Expected:** a BullMQ worker picks up the job, calls Claude, and writes
`status: COMPLETED`, `provider`, `model`, and `result` (`companySummary`,
`painPoints`, `callAngle`, `confidenceScore`, …). `GET /research/cost-analytics`
then shows non-zero spend.

**Actual:** the job sits in `PENDING` **forever** — `attempts` stays `0`,
`provider`/`model` stay `null`, `result` stays `null`, and it never goes
`COMPLETED` **or** `FAILED`. `cost-analytics` stays `$0`. Same for lead imports
(`POST /imports/leads`) and the campaign pipeline stages.

**Root cause:** Vercel serverless functions are request-scoped — there is no
long-running process to run the BullMQ consumers. The API enqueues jobs that
nothing drains.

**Fix:** run the worker(s) as a separate always-on service (a container / VM /
Vercel background function / Railway etc.) pointed at the same Redis, or switch
those endpoints to synchronous processing for the serverless deployment.

**Frontend impact:** the AI Research page can start jobs and polls them, but they
never complete on this deployment, so no `result` is ever shown and research cost
stays `$0`. Call Strategy (which needs a `COMPLETED` research job) is therefore
unreachable end-to-end.

**Status (2026-09-12):** the fix described in `BACKEND_FIX_PROMPT.md` is now
implemented in `vetta-backend` on branch `fix/empty-dist-on-rebuild` — a real
worker entrypoint (`src/worker.ts`, deployable via the repo's `render.yaml`/
`Procfile`/Fly `[processes]` recipe, see `docs/deploying-workers.md`), plus an
interim Vercel Cron drain (`GET/POST /internal/research/drain`) as a fallback
only. This branch is **not yet merged or deployed** — until it is, and a
worker service is actually running, this issue is still live in production.
Call-strategy generation's retry/error handling was also brought up to the
same standard (error-code taxonomy, stale-`PROCESSING` sweep, a structural
quality gate before publish) as part of the same change.

---

### 4. `GET /health` → 503 on the deployment

**Repro**

```bash
curl -s https://vetta-backend.vercel.app/health
# {"statusCode":503,"message":"Service Unavailable Exception","error":"ServiceUnavailableException",
#  "timestamp":"...","path":"/health"}
```

**Expected:** `200` when healthy (deep check: Postgres, Redis, BullMQ, memory).

**Actual:** consistently `503` (sometimes a `500` on cold start). Notably **`GET /ready` returns `200`** with Postgres + BullMQ `up`, and **`GET /live`** returns `200` — so DB/queue are fine. The failing indicator in `/health` that isn't in `/ready` is most likely **`memory.heap`** (Vercel's function memory ceiling vs the configured `@nestjs/terminus` `checkHeap` threshold), or the Redis indicator.

**Fix:** loosen / make configurable the `memory.heap` (and Redis) thresholds for the serverless runtime, or drop them from the deep check. The 503 body also omits `error` details about which indicator failed — `terminus` normally returns the per-indicator status; the `AllExceptionsFilter` seems to be flattening it.

**Impact:** breaks uptime/monitoring probes that hit `/health`. No direct user impact.

---

### 5. CORS allow-list is hardcoded to `http://localhost:3000`

**Repro**

```bash
curl -s -i -X OPTIONS https://vetta-backend.vercel.app/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
# HTTP/1.1 204
# Access-Control-Allow-Origin: http://localhost:3000     <-- always this, regardless of Origin
# Access-Control-Allow-Credentials: true
```

**Expected:** `Access-Control-Allow-Origin` reflects (or allow-lists) the calling frontend's origin.

**Actual:** every response carries `Access-Control-Allow-Origin: http://localhost:3000` no matter the request `Origin`. Any browser client not served from exactly `http://localhost:3000` — Vite dev on `:5173`, the deployed frontend, Postman-web — gets *“Failed to fetch”* (the browser blocks the response).

**Workaround in place:** the frontend dev server now proxies `/api/*` to the backend to dodge CORS. But the **deployed** frontend will hit this wall.

**Fix:** read allowed origins from env (e.g. `CORS_ORIGINS=https://app.vetta...,http://localhost:5173,http://localhost:3000`) and pass the list to `app.enableCors({ origin: [...], credentials: true })`.

---

## P3 — Minor / docs

### 6. `GET /auth/me` omits the user's name

**Actual response**

```json
{ "id": "...", "organizationId": "...", "role": "OWNER",
  "email": "user@example.com", "isActive": true }
```

`POST /auth/register` and `POST /auth/login` **do** return `firstName` / `lastName` nested under `user`, but `GET /auth/me` does not (nor any org name).

**Impact:** after a page reload the client only has the token, calls `/auth/me`, and can no longer show the user's display name — it falls back to the email. Please add `firstName`, `lastName` (and ideally `organizationName`) to the `/auth/me` payload so it matches the login/register `user` shape.

### 7. `GET /leads?limit=200` → 400 with no detail

`limit` is capped at **100** server-side. Requests above it return a generic `"Bad Request Exception"`. Please either document the max in the collection, raise it, or return `"limit must not be greater than 100"`.

### 8. Error envelope inconsistencies

- Several 400/500s return `message: "Bad Request Exception"` / `"Internal server error"` — the bare exception name, no class-validator `message: string[]`, so callers can't tell what's wrong. (Contrast `/leads` which returns proper field-level messages.)
- The collection documents an error field `requestId`, but it is **absent** from every error body observed. If a correlation id exists server-side, include it — it would make issues #2 and #4 debuggable.

---

### 9. Super Admin panel needs a real platform role + `/admin/*` endpoints

The frontend now ships a Super Admin panel (`src/admin/`, mounted at `/admin/*`) for platform-level operations: organizations, users, calls, subscriptions, plans, billing, usage, COGS, analytics, roles/permissions, audit logs, and system settings. Today it is gated **client-side only** by an email allow-list (`VITE_SUPER_ADMIN_EMAILS`, see `src/admin/rbac/superAdminGate.js`) because:

- `GET /auth/me` and `POST /auth/login`/`register` only ever return an org-scoped `role` (`OWNER`/`ADMIN`). There is no platform-wide role value (e.g. `SUPER_ADMIN`).
- There are no cross-tenant endpoints at all — every existing endpoint is implicitly scoped to the caller's own organization via the JWT.

**Required before production use:**
1. Add a real `SUPER_ADMIN` role returned from `/auth/me` (and login/register), enforced server-side.
2. Implement `/admin/*` endpoints and reject any caller whose role isn't `SUPER_ADMIN`, for at minimum:
   `GET/POST/PATCH/DELETE /admin/organizations[/:id[/users|calls|usage|subscription|billing|activity]][/suspend|/activate]`,
   `GET/PATCH/POST /admin/users[/:id[/role|/suspend|/activate]]`,
   `GET /admin/calls[/:id]`,
   `GET/PATCH/POST /admin/subscriptions[/:id[/plan|/cancel]]`,
   `GET/POST/PATCH /admin/plans[/:id[/archive|/activate]]`,
   `GET/POST /admin/billing/overview|invoices[/:id/refund]|payments`,
   `GET/POST /admin/usage/overview|[/:orgId/credits/adjust]`,
   `GET/PATCH /admin/cogs/categories[/:id]|/summary`,
   `GET /admin/analytics/overview|org-growth|revenue-trend|churn-trend|call-volume-trend|plan-distribution`,
   `GET/POST /admin/audit-logs`,
   `GET/POST /admin/notifications[/:id/read|/broadcast]`,
   `GET/PATCH /admin/roles|/permissions[/:id/permissions]`,
   `GET/PATCH /admin/settings/general|security`.
3. Once shipped, the frontend needs **no changes** — every `src/api/resources/admin*.js` function already calls the real path first and only falls back to mock data on a 404/405/501/502/503 (see `src/admin/lib/mockFallback.js`). Flip `src/admin/rbac/superAdminGate.js`'s `isSuperAdmin()` to check the real role once it exists.

---

## Endpoints confirmed working (145 checks) — for reference

Auth (register/login/refresh/logout/me), Leads (CRUD + filters + pagination + notes + timeline + analytics + validation codes), Research (list/start/get/provider-logs/cost-analytics), Campaign Templates, **full campaign launch lifecycle → RUNNING** (create-with-template → assign leads → ready → schedule → start → pause/resume/clone/archive/delete), campaign metrics/analytics/logs/history/events/retry-rules, Call Strategy, Qualification Frameworks (CRUD), Objections (list + override CRUD, 8 defaults), Voice (calls list, DNC list/add, webhook signature rejection), CRM (connections/sync/activities/deals/companies/contacts/mappings), Calendar (connections/meetings/stats/working-hours/holidays/availability-rule/oauth-url), Notifications (in-app/preferences/templates + publish + versions + preview/send-test/job-logs), Analytics (7 dashboards + events + funnel + 6 reports + export), Settings (org get/bulk/history/per-key + `providers/:name` + `feature-flags/:key` + export/import), `/ready`, `/live`.
