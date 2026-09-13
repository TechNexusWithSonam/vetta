/**
 * Shared "place a call" orchestration, used by both the Leads page and the
 * Live Calls "Call now" panel so the brief-generation fallback lives in one
 * place instead of two copies.
 *
 * Places a REAL outbound PSTN call for one lead via `POST /voice/calls`
 * (Retell/Bland). If the backend rejects it for a missing brief (422), this
 * generates + publishes a call strategy (needs a COMPLETED research job for
 * the lead) and retries once. OWNER/ADMIN only — callers are expected to gate
 * the triggering UI accordingly (see `src/lib/roles.js`).
 */
import { api, ApiError } from '../api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isDone = (s) => /^(completed|ready|succeeded|success)$/i.test(String(s || ''));
const isFailed = (s) => /^(failed|error|cancelled|canceled)$/i.test(String(s || ''));

/** Ensure a PUBLISHED call strategy exists for this lead. */
async function ensureStrategy(leadId, onStep) {
  onStep?.('Reusing existing brief…');
  const list = await api.callStrategies.list({ leadId, limit: 20 });
  const rows = list?.data ?? list ?? [];
  let strategy = rows.find((s) => isDone(s.status)) || rows[0] || null;

  if (!strategy) {
    onStep?.('Generating call strategy…');
    strategy = await api.callStrategies.start({ leadId }); // 422 if no COMPLETED research job
  }

  // Poll until the generation finishes.
  for (let i = 0; i < 40 && !isDone(strategy.status); i += 1) {
    if (isFailed(strategy.status)) throw new Error('Call strategy generation failed.');
    await sleep(3000);
    onStep?.(`Generating call strategy… (${i + 1})`);
    strategy = await api.callStrategies.get(strategy.id);
  }
  if (!isDone(strategy.status)) throw new Error('Call strategy is still generating — try again shortly.');

  const published = await api.callStrategies.publishedVersion(strategy.id).catch(() => null);
  if (!published) {
    onStep?.('Publishing brief…');
    await api.callStrategies.publish(strategy.id); // defaults to the latest DRAFT
  }
}

/**
 * @param {{ leadId: string, campaignId?: string, onStep?: (label: string) => void }} params
 * @returns {Promise<object>} the created voice call
 */
export async function placeCall({ leadId, campaignId, onStep }) {
  const payload = campaignId ? { leadId, campaignId } : { leadId };
  onStep?.('Starting call…');
  try {
    return await api.voice.calls.create(payload);
  } catch (err) {
    const needsBrief =
      err instanceof ApiError &&
      err.statusCode === 422 &&
      /call strategy|campaign script|brief/i.test(err.message || '');
    if (!needsBrief) throw err;
    await ensureStrategy(leadId, onStep);
    onStep?.('Starting call…');
    return api.voice.calls.create(payload);
  }
}
