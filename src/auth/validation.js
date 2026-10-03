/**
 * Client-side validation shared across the authentication screens.
 *
 * These checks mirror what the backend DTOs enforce so the user gets an inline
 * answer before a round-trip — they are a UX aid, never the security boundary.
 */

// Deliberately permissive: one `@`, a dot in the domain, no spaces. Good enough
// to catch typos without rejecting valid-but-unusual addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A short list of consumer domains — used only to *nudge* toward a work address
// on signup, never to block.
const FREEMAIL = new Set([
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'gmx.com',
  'mail.com',
]);

export function isEmail(value) {
  return EMAIL_RE.test(String(value || '').trim());
}

export function isFreemailDomain(value) {
  const at = String(value || '').toLowerCase().split('@')[1];
  return Boolean(at && FREEMAIL.has(at));
}

/**
 * The visible password rules. Returns them in a stable order with a `met`
 * flag so the UI can render a live checklist. No uppercase-letter or
 * special-character rule by design -- a plain lowercase-plus-numbers
 * password is accepted; length + containing a number is enough.
 * @param {string} password
 * @returns {{ id: string, label: string, met: boolean }[]}
 */
export function passwordRules(password) {
  const pw = String(password || '');
  return [
    { id: 'length', label: 'At least 8 characters', met: pw.length >= 8 },
    { id: 'number', label: 'One number', met: /\d/.test(pw) },
  ];
}

export function passwordMeetsPolicy(password) {
  return passwordRules(password).every((r) => r.met);
}

/**
 * A 0–4 strength score plus a label and the Tailwind colour token for the meter.
 * Base score is the count of satisfied rules (0–2); extra length and extra
 * variety (uppercase/special chars) are rewarded here even though neither is
 * a hard requirement, so a genuinely strong password can still reach the top
 * of the meter.
 */
export function passwordStrength(password) {
  const pw = String(password || '');
  if (!pw) return { score: 0, label: 'Enter a password', tone: 'slate' };

  const rules = passwordRules(pw);
  let score = rules.filter((r) => r.met).length;
  if (pw.length >= 12) score += 1;
  if (pw.length >= 16 || /[A-Z]/.test(pw) || /[^A-Za-z0-9\s]/.test(pw)) score += 1;
  score = Math.min(4, score);
  if (pw.length < 8) score = Math.min(score, 1);

  const table = [
    { label: 'Too weak', tone: 'rose' },
    { label: 'Weak', tone: 'rose' },
    { label: 'Fair', tone: 'amber' },
    { label: 'Good', tone: 'lime' },
    { label: 'Strong', tone: 'emerald' },
  ];
  return { score, ...table[score] };
}

/** Trim + collapse internal whitespace. */
export function clean(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}
