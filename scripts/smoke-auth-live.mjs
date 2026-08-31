/**
 * Live end-to-end check of the Auth client against the real backend
 * (`https://vetta-backend.vercel.app`), using `AI-SDR-SaaS.postman_collection.json`
 * as the source of truth for shapes, status codes and error handling.
 *
 * It registers a fresh throwaway organization, so it is safe to re-run.
 *
 * Run:  node scripts/smoke-auth-live.mjs
 */

import { api, ApiError, tokenStore } from '../src/api/index.js';

// ---- Node shims: localStorage for tokenStore ---------------------------------
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
};
globalThis.localStorage = globalThis.window.localStorage;

let pass = 0;
let fail = 0;
const ok = (label, cond, detail) => {
  if (cond) {
    pass += 1;
    console.log(`  ✓ ${label}`);
  } else {
    fail += 1;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

const stamp = Date.now();
const creds = {
  organizationName: `Smoke Test Org ${stamp}`,
  email: `smoke+${stamp}@vetta-test.dev`,
  password: 'TestPass123!',
  firstName: 'Smoke',
  lastName: 'Test',
};

console.log(`\nBackend: ${ (await import('../src/api/config.js')).API_BASE_URL }`);
console.log(`Test email: ${creds.email}\n`);

// 1. Register --------------------------------------------------------------
console.log('POST /auth/register');
let registered;
try {
  registered = await api.auth.register(creds);
  ok('201 returns { user, tokens }', Boolean(registered?.user && registered?.tokens));
  ok('tokens.accessToken present', typeof registered?.tokens?.accessToken === 'string');
  ok('tokens.refreshToken present', typeof registered?.tokens?.refreshToken === 'string');
  ok('user.role is OWNER', registered?.user?.role === 'OWNER', registered?.user?.role);
  ok('user.organizationId present', Boolean(registered?.user?.organizationId));
  ok('access token persisted to tokenStore', tokenStore.getAccessToken() === registered?.tokens?.accessToken);
} catch (err) {
  ok('register succeeded', false, `${err.statusCode} ${err.message}`);
}

// 2. /auth/me -----------------------------------------------------------
console.log('\nGET /auth/me');
try {
  const me = await api.auth.me();
  ok('200 returns id/email/role/organizationId', Boolean(me?.id && me?.email && me?.role && me?.organizationId));
  ok('email matches the registered email', me?.email?.toLowerCase() === creds.email.toLowerCase(), me?.email);
} catch (err) {
  ok('/auth/me succeeded', false, `${err.statusCode} ${err.message}`);
}

// 3. Wrong-password login -> 401 -------------------------------------
console.log('\nPOST /auth/login  (wrong password -> expect 401)');
try {
  await api.auth.login({ email: creds.email, password: 'WrongPass999!' });
  ok('rejected bad credentials', false, 'no error thrown');
} catch (err) {
  ok('throws ApiError', err instanceof ApiError);
  ok('statusCode is 401', err.statusCode === 401, String(err.statusCode));
  ok('error payload has AllExceptionsFilter fields', Boolean(err.timestamp && err.path));
}

// 4. Correct login ----------------------------------------------------
console.log('\nPOST /auth/login  (correct password)');
let refreshTokenBeforeRotate;
try {
  const session = await api.auth.login({ email: creds.email, password: creds.password });
  ok('200 returns { user, tokens }', Boolean(session?.user && session?.tokens));
  refreshTokenBeforeRotate = session?.tokens?.refreshToken;
  ok('tokenStore updated with new access token', tokenStore.getAccessToken() === session?.tokens?.accessToken);
} catch (err) {
  ok('login succeeded', false, `${err.statusCode} ${err.message}`);
}

// 5. Refresh rotation ----------------------------------------------
console.log('\nPOST /auth/refresh');
try {
  const rotated = await api.auth.refresh();
  ok('200 returns { accessToken, refreshToken }', Boolean(rotated?.accessToken && rotated?.refreshToken));
  ok('refresh token actually rotated', rotated.refreshToken !== refreshTokenBeforeRotate);
  ok('tokenStore holds the rotated access token', tokenStore.getAccessToken() === rotated.accessToken);

  // Old refresh token is now spent -> reuse must 401 (theft detection).
  try {
    await api.auth.refresh(refreshTokenBeforeRotate);
    ok('reusing a spent refresh token is rejected', false, 'no error thrown');
  } catch (err) {
    ok('reusing a spent refresh token -> 401', err.statusCode === 401, String(err.statusCode));
  }
} catch (err) {
  ok('refresh succeeded', false, `${err.statusCode} ${err.message}`);
}

// 6. Duplicate registration -> 409 -------------------------------
console.log('\nPOST /auth/register  (duplicate email -> expect 409)');
try {
  await api.auth.register(creds);
  ok('duplicate email rejected', false, 'no error thrown');
} catch (err) {
  ok('statusCode is 409', err.statusCode === 409, String(err.statusCode));
}

// 7. Logout + post-logout access -------------------------------
console.log('\nPOST /auth/logout');
try {
  // Re-login to hold a valid pair (step 5 may have left a rotated pair; that's fine).
  await api.auth.login({ email: creds.email, password: creds.password });
  await api.auth.logout();
  ok('logout clears tokenStore', !tokenStore.isAuthenticated());

  try {
    await api.auth.me();
    ok('/auth/me after logout is rejected', false, 'no error thrown');
  } catch (err) {
    ok('/auth/me after logout -> 401', err.statusCode === 401, String(err.statusCode));
  }
} catch (err) {
  ok('logout flow succeeded', false, `${err.statusCode} ${err.message}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
