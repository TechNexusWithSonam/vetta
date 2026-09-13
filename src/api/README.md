# `src/api` — AI SDR SaaS API client

A framework-agnostic client for the AI SDR SaaS backend (NestJS), generated
one-to-one from **`AI-SDR-SaaS.postman_collection.json`** at the repo root. Every
folder in that collection is a namespace here; every request is a method.

## Usage

```js
import { api } from '../api'; // path is relative — this project has no import alias

// Auth — tokens are persisted to localStorage automatically
await api.auth.login({ email, password });
const me = await api.auth.me();

// Resources — returns the unwrapped `data`, throws `ApiError` on non-2xx
const leads = await api.leads.list({ page: 1, limit: 20, status: 'NEW' });
const lead = await api.leads.get(leadId);
await api.campaigns.start(campaignId);

// File download endpoints return a Blob
const csv = await api.analytics.exports.download(exportId);
```

Handle errors with the typed `ApiError`:

```js
import { ApiError } from '../api';

try {
  await api.leads.create({ email });
} catch (err) {
  if (err instanceof ApiError && err.statusCode === 409) {
    // duplicate email
  }
}
```

## What the client does for you

| Concern | Behaviour |
| --- | --- |
| Base URL | `VITE_API_BASE_URL` if set, else `/api` in `npm run dev` (proxied — see below) or `https://vetta-backend.vercel.app` in a build. |
| Success envelope | Unwraps `{ success, data, timestamp }` → returns `data`. Bare arrays/objects pass through. |
| Errors | Throws `ApiError` mirroring `AllExceptionsFilter` (`statusCode`, `message`, `error`, `path`, `requestId`, …). |
| Auth | Adds `Authorization: Bearer <accessToken>` from `tokenStore`. `@Public()` routes (auth, health, webhooks) opt out. |
| Refresh | On a `401`, rotates the refresh token via `POST /auth/refresh` **once** and replays the request. A failed refresh clears stored auth. |
| Query params | `undefined` / `null` / `''` dropped; arrays repeated; `Date` → ISO. |
| Timeout | `VITE_API_TIMEOUT_MS` (default 30000; `0` disables). |
| 204 responses | Resolve to `null`. |

## Layout

```
src/api/
  index.js            barrel — exports `api`, `ApiError`, `tokenStore`, `http`, …
  client.js           request() core: fetch, envelope, auth, refresh, query
  config.js           base URL, timeout, storage keys
  ApiError.js         typed error
  tokenStore.js       localStorage-backed token/user store (+ subscribe())
  resources/          one module per collection folder
```

## CORS / the dev proxy

The hosted backend only returns `Access-Control-Allow-Origin: http://localhost:3000`,
so a browser on the Vite dev port (`5173`) gets "Failed to fetch" on every call.
To avoid that, `npm run dev` makes the client call the **same-origin** path
`/api/*`, and `vite.config.js` proxies `/api` → `https://vetta-backend.vercel.app`
server-side (no CORS). Point the proxy at a local backend with
`VITE_DEV_API_PROXY_TARGET`. A production build calls the hosted URL directly —
serve it from an allowed origin or set `VITE_API_BASE_URL`.

## Auth is wired into the app

`src/context/AuthContext.jsx` (`AuthProvider` + `useAuth()` from
`src/context/useAuth.js`) drives the session:

- On load it hydrates the user via `GET /auth/me` if a token is stored.
- `useAuth()` wraps `api.auth.*` (`login` / `register` / `logout` / `verifyEmail` /
  `forgotPassword` / `resetPassword` / `resendVerification`) and exposes the
  `needsVerification` / `onboardingComplete` gates.
- Guards: `src/components/RequireAuth.jsx` (private app), `RequireSession.jsx`
  (`/verify-email`, `/onboarding`), `RedirectIfAuthed.jsx` (`/login`, `/signup`,
  `/forgot-password`). The auth screens live in `src/pages/{SignUp,LogIn,
  ForgotPassword,ResetPassword,VerifyEmail,Onboarding}.jsx` on the shared shell
  in `src/auth/`. `AppLayout` shows the user + a logout button.

The deployed backend only implements `register` / `login` / `refresh` / `logout`
/ `me`. The password-reset and email-verification screens call the conventional
`/auth/*` routes and degrade gracefully (privacy-preserving) until those ship.

Other domains are **not** wired to pages yet — point a page at `api.*` when
you're ready to make it live.

## Verifying

| Command | What it does |
| --- | --- |
| `npm run verify:api` | Offline. Stubs `fetch`, drives all **211** distinct collection routes through the client, asserts method / path / query / auth-header / envelope match `AI-SDR-SaaS.postman_collection.json`. Run after editing `resources/` or `client.js`. |
| `npm run smoke:auth` | Live. Full auth lifecycle against the real backend (register → me → refresh rotation + theft detection → 401/409 → logout). 20 assertions. |
| `npm run smoke:api` | Live. Registers a throwaway org and exercises every non-destructive endpoint (all reads + safe create/update/delete cycles). 139 pass; skips real phone calls, provider-secret connections and webhook-signature routes. |

### Known deployment issues (client is correct; the hosted backend is at fault)

`npm run smoke:api` flags these as `⚠` rather than failures — the client sends
exactly what the collection documents:

- `GET`/`PUT /settings/branding`, `/settings/credentials`, `/settings/feature-flags`,
  `/settings/preferences`, `/settings/providers` → `400 "Unknown setting key"`.
  The deployment registers `GET /settings/:key` ahead of these literal sub-routes.
  (`/settings/providers/claude` and `/settings/feature-flags/:key` work.)
- `POST /notification-webhook-configs` → `500` (secret generation / SSRF check crash).
- `POST /campaigns/:id/schedule` from `DRAFT` → `409`; the deployment requires
  `READY` first.
- `POST /campaign-templates` rejects a bare `{ name }` — send `scriptPromptKey`
  and `defaultScheduleConfig` too.
- `GET /health` intermittently `500`s on cold start (`/ready` covers the same deps).
