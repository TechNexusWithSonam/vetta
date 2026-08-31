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

## Endpoints confirmed working (145 checks) — for reference

Auth (register/login/refresh/logout/me), Leads (CRUD + filters + pagination + notes + timeline + analytics + validation codes), Research (list/start/get/provider-logs/cost-analytics), Campaign Templates, **full campaign launch lifecycle → RUNNING** (create-with-template → assign leads → ready → schedule → start → pause/resume/clone/archive/delete), campaign metrics/analytics/logs/history/events/retry-rules, Call Strategy, Qualification Frameworks (CRUD), Objections (list + override CRUD, 8 defaults), Voice (calls list, DNC list/add, webhook signature rejection), CRM (connections/sync/activities/deals/companies/contacts/mappings), Calendar (connections/meetings/stats/working-hours/holidays/availability-rule/oauth-url), Notifications (in-app/preferences/templates + publish + versions + preview/send-test/job-logs), Analytics (7 dashboards + events + funnel + 6 reports + export), Settings (org get/bulk/history/per-key + `providers/:name` + `feature-flags/:key` + export/import), `/ready`, `/live`.
