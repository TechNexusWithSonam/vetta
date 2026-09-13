/**
 * Translate an {@link ApiError} (or anything thrown) into a short, human message
 * for a given auth context. Keeps security-sensitive flows vague on purpose:
 * login never says which of email/password was wrong, and the reset/verify
 * "request" steps never confirm whether an account exists.
 */

import { ApiError } from '../api';
import { AUTH_ENDPOINT_UNAVAILABLE } from '../api/resources/auth.js';

/** True when the failure means "the backend route isn't there / reachable". */
export function isEndpointUnavailable(err) {
  return err instanceof ApiError && AUTH_ENDPOINT_UNAVAILABLE.has(err.statusCode);
}

function validatorDetail(err) {
  const m = err?.body?.message;
  if (Array.isArray(m) && m.length) return m.join('. ');
  if (typeof m === 'string' && m && m !== err.error) return m;
  return null;
}

/**
 * @param {unknown} err
 * @param {'login'|'signup'|'forgot'|'reset'|'verify'|'resend'|'session'} context
 * @returns {string}
 */
export function describeAuthError(err, context) {
  if (!(err instanceof ApiError)) {
    return 'Something went wrong. Check your connection and try again.';
  }

  const { statusCode } = err;

  if (statusCode === 0) {
    return err.kind === 'timeout'
      ? 'The request timed out. Please try again.'
      : "We couldn't reach the server. Check your connection and try again.";
  }
  if (statusCode === 429) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (statusCode >= 500) {
    return 'The server had a problem handling that. Please try again shortly.';
  }

  switch (context) {
    case 'login':
      if (statusCode === 401) return 'The email or password you entered is incorrect.';
      if (statusCode === 403)
        return 'This account is disabled or awaiting verification. Check your inbox or contact your workspace admin.';
      if (statusCode === 400)
        return validatorDetail(err) || 'Enter a valid email and password.';
      break;

    case 'signup':
      if (statusCode === 409)
        return 'An account already exists with this email. Log in instead.';
      if (statusCode === 400)
        return validatorDetail(err) || 'Some details need another look. Check the fields above.';
      break;

    case 'reset':
      if (statusCode === 400 || statusCode === 404 || statusCode === 410)
        return 'This reset link is invalid or has expired. Request a new one.';
      break;

    case 'verify':
      if (statusCode === 400 || statusCode === 404 || statusCode === 410)
        return 'This verification link is invalid or has expired. Send yourself a fresh one below.';
      break;

    default:
      break;
  }

  return validatorDetail(err) || err.message || 'Something went wrong. Please try again.';
}
