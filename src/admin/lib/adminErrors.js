/**
 * One place that turns an API failure into a message an operator can act
 * on, so every admin page handles 401/403/404/409/422/5xx/network the same
 * way. Validation (400/422) and conflict (409) messages come from the
 * server's DTO/business rules and are shown as-is.
 */
export function adminErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;
  const status = err.statusCode ?? err.status;
  const serverMessage = Array.isArray(err.body?.message) ? err.body.message.join('; ') : err.message;

  switch (true) {
    case status === 0:
      return err.kind === 'timeout'
        ? 'The server took too long to respond. Please retry.'
        : 'Can’t reach the server. Check your connection and retry.';
    case status === 401:
      return 'Your session has expired. Please sign in again.';
    case status === 403:
      return /permission/i.test(serverMessage || '')
        ? `You don’t have access to this: ${serverMessage}.`
        : 'You don’t have permission to do this.';
    case status === 404:
      return 'Not found — it may have been removed or never existed.';
    case status === 400 || status === 409 || status === 422:
      return serverMessage || fallback;
    case status === 503:
      return serverMessage || 'The service is temporarily unavailable. Please retry shortly.';
    case status >= 500:
      return 'The server hit an unexpected error. Please retry in a moment.';
    default:
      return serverMessage || fallback;
  }
}

/** An error-shaped object ErrorState can render with the friendly message. */
export function friendlyError(err) {
  return err ? { ...err, message: adminErrorMessage(err) } : null;
}
