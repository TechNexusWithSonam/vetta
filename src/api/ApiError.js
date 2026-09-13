/**
 * Error thrown for any non-2xx API response.
 *
 * Mirrors the backend's `AllExceptionsFilter` payload shape:
 * `{ statusCode, message, error, timestamp, path, requestId }`.
 * When the response body is not JSON (network failure, HTML error page, an
 * aborted request) the fields are filled in with sensible fallbacks.
 */
export class ApiError extends Error {
  /**
   * @param {object} params
   * @param {number} params.statusCode  HTTP status code (0 for network/abort).
   * @param {string} params.message     Human-readable message.
   * @param {string} [params.error]     Short error code, e.g. "Bad Request".
   * @param {string} [params.timestamp] ISO timestamp from the server.
   * @param {string} [params.path]      Request path the server reported.
   * @param {string} [params.requestId] Correlation id from the server.
   * @param {unknown} [params.body]     Raw parsed response body, for debugging.
   * @param {'http'|'network'|'timeout'|'parse'} [params.kind]
   */
  constructor({
    statusCode,
    message,
    error,
    timestamp,
    path,
    requestId,
    body,
    kind = 'http',
  }) {
    super(message || error || `Request failed with status ${statusCode}`);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.status = statusCode; // alias
    this.error = error;
    this.timestamp = timestamp;
    this.path = path;
    this.requestId = requestId;
    this.body = body;
    this.kind = kind;
  }

  /** True for 401 responses — the client uses this to trigger a token refresh. */
  get isUnauthorized() {
    return this.statusCode === 401;
  }

  /** True for 4xx responses (client mistakes: validation, not found, conflict…). */
  get isClientError() {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /** True for 5xx responses and transport failures. */
  get isServerError() {
    return this.statusCode === 0 || this.statusCode >= 500;
  }

  /**
   * Build an ApiError from a fetch Response whose body has already been read.
   * @param {Response} response
   * @param {unknown} parsedBody  The JSON (or text) body already parsed by the caller.
   */
  static fromResponse(response, parsedBody) {
    const b = parsedBody && typeof parsedBody === 'object' ? parsedBody : {};
    return new ApiError({
      statusCode: b.statusCode ?? response.status,
      message: b.message ?? plainTextMessage(parsedBody) ?? response.statusText,
      error: b.error,
      timestamp: b.timestamp,
      path: b.path,
      requestId: b.requestId,
      body: parsedBody,
      kind: 'http',
    });
  }
}

/**
 * A non-JSON body is only usable as a user-facing message if it actually
 * looks like one — short plain text. A misconfigured proxy or an unrelated
 * server on the target port can return an HTML error page (or another app's
 * markup entirely); dumping that verbatim into the UI is worse than a
 * generic fallback, so anything HTML-shaped or too long is rejected here.
 * @param {unknown} body
 * @returns {string|null}
 */
function plainTextMessage(body) {
  if (typeof body !== 'string') return null;
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 300) return null;
  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) return null;
  return trimmed;
}
