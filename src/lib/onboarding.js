/**
 * Onboarding completion state.
 *
 * The backend has no onboarding resource, so a completed run is recorded
 * per-user in localStorage (non-sensitive: team type, goals, team size). The
 * answers are also POSTed best-effort to `/auth/onboarding` and
 * `/settings/preferences` so they land server-side once those routes exist;
 * failures there are swallowed and never block the user.
 */

import { api, http } from '../api';

const KEY = 'vetta.onboarding.v1';

function readAll() {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* private mode / quota — the in-session redirect still works via context */
  }
}

/** @param {string|undefined} userId */
export function isOnboardingComplete(userId) {
  if (!userId) return false;
  const entry = readAll()[userId];
  return Boolean(entry && entry.completedAt);
}

/**
 * Persist a completed onboarding run for a user.
 * @param {string} userId
 * @param {{ teamType?: string, goals?: string[], teamSize?: string, skipped?: boolean }} answers
 */
export function completeOnboarding(userId, answers = {}) {
  if (!userId) return;
  const map = readAll();
  map[userId] = { ...answers, completedAt: new Date().toISOString() };
  writeAll(map);

  // Best-effort server sync — never awaited, never surfaced.
  Promise.allSettled([
    http.post('/auth/onboarding', answers),
    api.settings.preferences.update({ onboarding: answers }),
  ]).catch(() => {});
}

/** Wipe local onboarding state (used on logout so a shared machine stays clean). */
export function clearOnboarding(userId) {
  const map = readAll();
  if (userId) delete map[userId];
  else {
    writeAll({});
    return;
  }
  writeAll(map);
}
