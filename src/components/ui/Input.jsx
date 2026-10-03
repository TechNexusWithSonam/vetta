/**
 * Text inputs + the shared field chrome (label / hint / error) that Select and
 * the choice controls also reuse. Every field is label-bound and wires
 * `aria-invalid` / `aria-describedby` so screen readers announce errors.
 *
 * Visual language matches `src/auth/fields.jsx` so auth and app feel like one
 * product: h-11, rounded-lg, slate-300 border, 4px brand focus ring.
 */

import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from './cn.js';
import { FIELD_BASE, fieldTone } from './fieldStyles.js';

export function Label({ htmlFor, children, required, optional, right, className = '' }) {
  return (
    <div className={cn('mb-1.5 flex items-center justify-between gap-2', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {children}
        {required && <span className="ml-0.5 text-rose-500" aria-hidden="true">*</span>}
      </label>
      {optional && !right && <span className="text-xs font-normal text-slate-400">Optional</span>}
      {right}
    </div>
  );
}

export function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600">
      <AlertCircle size={13} className="mt-px shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function FieldHint({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-slate-500">
      {children}
    </p>
  );
}

/**
 * Wraps a control with label + hint/error and hands the control the ids it
 * needs. `render({ id, describedBy, invalid })` returns the actual input.
 */
export function FieldShell({
  label,
  hint,
  error,
  required,
  optional,
  labelRight,
  className = '',
  id: idProp,
  render,
}) {
  const reactId = useId();
  const id = idProp || `fld-${reactId}`;
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const invalid = Boolean(error);
  const describedBy =
    [invalid ? errId : null, hint && !invalid ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} required={required} optional={optional} right={labelRight}>
          {label}
        </Label>
      )}
      {render({ id, describedBy, invalid })}
      {invalid ? <FieldError id={errId}>{error}</FieldError> : <FieldHint id={hintId}>{hint}</FieldHint>}
    </div>
  );
}

export function Input({
  label,
  hint,
  error,
  required,
  optional,
  labelRight,
  icon: Icon,
  trailing,
  className = '',
  inputClassName = '',
  id,
  ref,
  ...props
}) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      labelRight={labelRight}
      className={className}
      id={id}
      render={({ id: fieldId, describedBy, invalid }) => (
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
            id={fieldId}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              FIELD_BASE,
              fieldTone(invalid),
              'h-11',
              Icon ? 'pl-10' : 'pl-3.5',
              trailing ? 'pr-11' : 'pr-3.5',
              inputClassName,
            )}
            {...props}
          />
          {trailing && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
          )}
        </div>
      )}
    />
  );
}

export function Textarea({
  label,
  hint,
  error,
  required,
  optional,
  labelRight,
  rows = 4,
  className = '',
  inputClassName = '',
  id,
  ref,
  ...props
}) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      labelRight={labelRight}
      className={className}
      id={id}
      render={({ id: fieldId, describedBy, invalid }) => (
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(FIELD_BASE, fieldTone(invalid), 'resize-y px-3.5 py-2.5 leading-relaxed', inputClassName)}
          {...props}
        />
      )}
    />
  );
}

export default Input;
