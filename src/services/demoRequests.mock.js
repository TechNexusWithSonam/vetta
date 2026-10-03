/**
 * Isolated mock adapter for {@link module:services/demoRequests}.
 *
 * The demo-request / contact endpoint does not exist on the backend yet. This
 * file is the ONLY place that pretends it does: it validates the payload,
 * simulates network latency, keeps a local log, and can be told to fail once so
 * the UI's error path is testable. Delete this file when the real endpoint ships.
 */

const STORE_KEY = 'vetta.mock.demoRequests';
const LATENCY_MS = 700;

let failNext = false;

function readLog() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeLog(entries) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(entries.slice(-25)));
  } catch {
    /* storage unavailable — the in-memory resolve still works this session */
  }
}

export const __mock = {
  /** Make the next submit reject, to exercise the error state. */
  failNext() {
    failNext = true;
  },
  reset() {
    failNext = false;
    writeLog([]);
  },
  log: readLog,
};

export async function submit(payload) {
  await new Promise((r) => setTimeout(r, LATENCY_MS));

  if (failNext) {
    failNext = false;
    const err = new Error('We could not send your request. Please try again.');
    err.code = 'MOCK_FAILURE';
    throw err;
  }

  const required = ['name', 'email', 'company'];
  const missing = required.filter((k) => !String(payload?.[k] || '').trim());
  if (missing.length) {
    const err = new Error(`Missing required field(s): ${missing.join(', ')}`);
    err.code = 'VALIDATION';
    err.fields = missing;
    throw err;
  }

  const record = {
    id: crypto.randomUUID?.() || String(Date.now()),
    receivedAt: new Date().toISOString(),
    ...payload,
  };
  const log = readLog();
  log.push(record);
  writeLog(log);

  if (import.meta?.env?.DEV) {
    console.info('[mock demoRequests] captured', record);
  }

  return { id: record.id, status: 'received' };
}
