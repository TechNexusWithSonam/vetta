/**
 * Reusable form primitives for the authentication screens. Every input is
 * label-bound, exposes `aria-invalid` / `aria-describedby`, and forwards refs so
 * a form can focus its first error.
 */

import React, { forwardRef, useId, useState } from 'react';
import {
  Eye,
  EyeOff,
  Check,
  X as XIcon,
  Loader2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { passwordRules, passwordStrength } from './validation.js';

const BASE_INPUT =
  'block w-full rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors duration-150 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

function inputTone(invalid) {
  return invalid
    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
    : 'border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10';
}

/** A labelled text input with optional leading icon and inline error/hint. */
export const TextField = forwardRef(function TextField(
  {
    label,
    hint,
    error,
    icon: Icon,
    trailing,
    className = '',
    id: idProp,
    optional = false,
    labelRight,
    ...props
  },
  ref,
) {
  const reactId = useId();
  const id = idProp || `f-${reactId}`;
  const describedBy =
    [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className={className}>
      {(label || labelRight) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label ? (
            <label htmlFor={id} className="text-sm font-medium text-slate-700">
              {label}
            </label>
          ) : (
            <span />
          )}
          {optional && !labelRight && (
            <span className="text-xs font-normal text-slate-400">Optional</span>
          )}
          {labelRight}
        </div>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`${BASE_INPUT} ${inputTone(Boolean(error))} h-11 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${trailing ? 'pr-11' : 'pr-3.5'}`}
          {...props}
        />
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600"
        >
          <AlertCircle size={13} className="mt-px shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

/** Text input specialised for passwords: show/hide toggle + optional meter. */
export const PasswordField = forwardRef(function PasswordField(
  {
    label = 'Password',
    error,
    hint,
    showMeter = false,
    showChecklist = false,
    value = '',
    id: idProp,
    className = '',
    ...props
  },
  ref,
) {
  const reactId = useId();
  const id = idProp || `p-${reactId}`;
  const [visible, setVisible] = useState(false);

  const rules = passwordRules(value);
  const met = rules.filter((r) => r.met).length;
  const strength = passwordStrength(value);
  const meterTone = {
    slate: 'bg-slate-200',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
    lime: 'bg-lime-500',
    emerald: 'bg-emerald-500',
  }[strength.tone];

  return (
    <div className={className}>
      <TextField
        ref={ref}
        id={id}
        label={label}
        type={visible ? 'text' : 'password'}
        value={value}
        error={error}
        hint={hint}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            tabIndex={-1}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        }
        {...props}
      />

      {showMeter && (
        <div className="mt-2.5" aria-hidden="true">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < strength.score ? meterTone : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Password strength: <span className="font-medium text-slate-700">{strength.label}</span>
          </p>
        </div>
      )}

      {showChecklist && (
        <>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  rule.met ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    rule.met ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}
                >
                  {rule.met ? (
                    <Check size={11} aria-hidden="true" />
                  ) : (
                    <XIcon size={10} className="text-slate-400" aria-hidden="true" />
                  )}
                </span>
                {rule.label}
              </li>
            ))}
          </ul>
          <p className="sr-only" aria-live="polite">
            Password meets {met} of {rules.length} requirements.
          </p>
        </>
      )}
    </div>
  );
});

/** Full-width primary submit button with a loading state. */
export function SubmitButton({ loading, children, loadingText, className = '', ...props }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      className={`group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          <span>{loadingText || 'Working…'}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </>
      )}
    </button>
  );
}

/** A dismissible form-level error banner (role=alert). */
export function FormBanner({ tone = 'error', children, action }) {
  if (!children) return null;
  const tones = {
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    info: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  };
  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${tones[tone]}`}
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 leading-snug">
        {children}
        {action && <div className="mt-1.5">{action}</div>}
      </div>
    </div>
  );
}

/** "──── OR ────" divider. */
export function OrDivider({ label = 'OR' }) {
  return (
    <div className="relative my-6" role="separator" aria-label={label}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function MicrosoftGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#F25022" d="M1 1h7.6v7.6H1z" />
      <path fill="#7FBA00" d="M9.4 1H17v7.6H9.4z" />
      <path fill="#00A4EF" d="M1 9.4h7.6V17H1z" />
      <path fill="#FFB900" d="M9.4 9.4H17V17H9.4z" />
    </svg>
  );
}

/** One or both social sign-in buttons. `providers` picks which show. */
export function SocialAuthButtons({
  onSelect,
  disabled = false,
  verb = 'Continue with',
  providers = ['google', 'microsoft'],
}) {
  const items = {
    google: { label: 'Google', glyph: <GoogleGlyph /> },
    microsoft: { label: 'Microsoft', glyph: <MicrosoftGlyph /> },
  };
  return (
    <div className="grid gap-2.5">
      {providers.map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(key)}
          className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {items[key].glyph}
          <span>
            {verb} {items[key].label}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Labelled native select used for the optional signup fields + onboarding. */
export const SelectField = forwardRef(function SelectField(
  { label, error, hint, id: idProp, optional = false, children, className = '', ...props },
  ref,
) {
  const reactId = useId();
  const id = idProp || `s-${reactId}`;
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700"
        >
          <span>{label}</span>
          {optional && <span className="text-xs font-normal text-slate-400">Optional</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${BASE_INPUT} ${inputTone(Boolean(error))} h-11 px-3`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
      {!error && hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
});
