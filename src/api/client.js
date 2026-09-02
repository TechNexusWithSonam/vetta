/**
 * Core HTTP client for the AI SDR SaaS backend.
 *
 * Responsibilities:
 *  - Prefix every path with {@link API_BASE_URL} and serialize query params.
 *  - Attach `Authorization: Bearer <accessToken>` from {@link tokenStore}.
 *  - Unwrap the global success envelope `{ success, data, timestamp }` and
 *    return `data` directly (endpoints that return a raw array/object are
 *    passed through untouched).
 *  - Raise {@link ApiError} for every non-2xx response, matching the backend's
 *    `AllExceptionsFilter` shape.
 *  - On a 401, transparently rotate the refresh token via `POST /auth/refresh`
 *    once and replay the original request.
 *
 * Endpoint modules in `./resources/*` are thin wrappers over {@link request}.
 */

import { API_BASE_URL, API_TIMEOUT_MS } from './config.js';
import { ApiError } from './ApiError.js';
import { tokenStore } from './tokenStore.js';

const REFRESH_PATH = '/auth/refresh';

/** Shared in-flight refresh so parallel 401s trigger only one rotation. */
let refreshInFlight = null;

/**
 * Serialize a params object into a query string.
 * - `undefined` / `null` values are skipped.
 * - Arrays are repeated (`tags=a&tags=b`).
 * - `Date` values are sent as ISO strings.
 * @param {Record<string, unknown>|undefined} params
 * @returns {string} e.g. `"?page=1&limit=20"` or `""`
 */
export function buildQuery(params) {
  if (!params) return '';
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) {
      if (v === undefined || v === null || v === '') continue;
      sp.append(key, v instanceof Date ? v.toISOString() : String(v));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

function joinUrl(path, query) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${clean}${buildQuery(query)}`;
}

async function parseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204 || response.status === 205) return null;
  const text = await response.text();
  if (!text) return null;
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

/**
 * Unwrap `{ success, data, timestamp }`. Anything else is returned as-is so the
 * handful of endpoints that respond with a bare array/object still work.
 */
function unwrap(body) {
  if (
    body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    'success' in body &&
    'data' in body
  ) {
    return body.data;
  }
  return body;
}

async function rotateRefreshToken() {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const res = await fetch(joinUrl(REFRESH_PATH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const body = await parseBody(res);
      if (!res.ok) throw ApiError.fromResponse(res, body);
      const data = unwrap(body) || {};
      // Refresh returns `{ accessToken, refreshToken }` (no envelope-nested `tokens`).
      const next = data.tokens || data;
      if (!next.accessToken) {
        throw new ApiError({ statusCode: 401, message: 'Token refresh returned no access token' });
      }
      tokenStore.setTokens(next);
      return true;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  try {
    return await refreshInFlight;
  } catch {
    tokenStore.clear();
    return false;
  }
}

/**
 * @typedef {object} RequestOptions
 * @property {Record<string, unknown>} [query]   Query params (see {@link buildQuery}).
 * @property {unknown} [body]                     JSON request body.
 * @property {boolean} [auth=true]                Send the bearer token.
 * @property {boolean} [raw=false]                Resolve with the `Response`
 *   object instead of a parsed body (file downloads / streaming endpoints).
 * @property {Record<string, string>} [headers]  Extra request headers.
 * @property {AbortSignal} [signal]              Caller abort signal.
 * @property {boolean} [_isRetry]                Internal: guards the 401 replay.
 */

/**
 * Perform an API request.
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} method
 * @param {string} path                Path beginning with `/` (no base URL).
 * @param {RequestOptions} [options]
 * @returns {Promise<any>} The unwrapped `data`, or `null` for 204 responses,
 *   or the raw `Response` when `raw` is set.
 */
export async function request(method, path, options = {}) {
  const {
    query,
    body,
    auth = true,
    raw = false,
    headers: extraHeaders,
    signal,
    _isRetry = false,
  } = options;

  const headers = { Accept: 'application/json', ...extraHeaders };
  const hasBody = body !== undefined && body !== null;
  if (hasBody && !(body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (auth) {
    const token = tokenStore.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Timeout + caller abort, combined.
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  const timeout =
    API_TIMEOUT_MS > 0
      ? setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), API_TIMEOUT_MS)
      : null;

  let response;
  try {
    response = await fetch(joinUrl(path, query), {
      method,
      headers,
      body: hasBody
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
      throw new ApiError({
        statusCode: 0,
        message: err.message || 'Request aborted',
        path,
        kind: err.name === 'TimeoutError' ? 'timeout' : 'network',
      });
    }
    throw new ApiError({
      statusCode: 0,
      message: err?.message || 'Network request failed',
      path,
      kind: 'network',
    });
  } finally {
    if (timeout) clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', onAbort);
  }

  // Transparent one-shot refresh + replay on 401.
  if (response.status === 401 && auth && !_isRetry && path !== REFRESH_PATH) {
    const refreshed = await rotateRefreshToken();
    if (refreshed) {
      return request(method, path, { ...options, _isRetry: true });
    }
  }

  if (raw) {
    if (!response.ok) throw ApiError.fromResponse(response, await parseBody(response));
    return response;
  }

  const parsed = await parseBody(response);
  if (!response.ok) throw ApiError.fromResponse(response, parsed);
  return unwrap(parsed);
}

/** Method-bound helpers: `http.get(path, opts)`, `http.post(path, body, opts)`, … */
export const http = {
  get: (path, options) => request('GET', path, options),
  delete: (path, options) => request('DELETE', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
};
