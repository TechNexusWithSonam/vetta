/**
 * Checkbox / Radio — styled native inputs so focus, keyboard, and form
 * semantics come for free. Each renders as a clickable row: control + label
 * (+ optional description). `RadioGroup` wires a shared `name` and exposes a
 * simple controlled `value` / `onChange(value)` API.
 */

import React, { createContext, useContext, useId } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from './cn.js';

const CONTROL_BASE =
  'peer h-4 w-4 shrink-0 appearance-none border border-slate-300 bg-white transition-colors ' +
  'checked:border-brand-600 checked:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

function Row({ children, disabled, className }) {
  return (
    <label
      className={cn(
        'flex items-start gap-2.5 text-sm',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className,
      )}
    >
      {children}
    </label>
  );
}

export function Checkbox({
  label,
  description,
  indeterminate = false,
  className = '',
  disabled,
  id,
  ref,
  ...props
}) {
  const reactId = useId();
  const fieldId = id || `cb-${reactId}`;
  const setRef = (node) => {
    if (node) node.indeterminate = indeterminate;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  return (
    <Row disabled={disabled} className={className}>
      <span className="relative flex h-5 items-center">
        <input
          ref={setRef}
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          className={cn(CONTROL_BASE, 'rounded')}
          {...props}
        />
        <Check
          size={12}
          strokeWidth={3}
          aria-hidden="true"
          className="pointer-events-none absolute left-0.5 top-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
        />
        {indeterminate && (
          <Minus
            size={12}
            strokeWidth={3}
            aria-hidden="true"
            className="pointer-events-none absolute left-0.5 top-1/2 -translate-y-1/2 text-white"
          />
        )}
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="font-medium text-slate-800">{label}</span>}
          {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
        </span>
      )}
    </Row>
  );
}

const RadioGroupContext = createContext(null);

export function RadioGroup({ name, value, onChange, children, className = '', ...props }) {
  const reactId = useId();
  const groupName = name || `rg-${reactId}`;
  return (
    <div role="radiogroup" className={cn('space-y-2', className)} {...props}>
      <RadioGroupContext.Provider value={{ name: groupName, value, onChange }}>
        {children}
      </RadioGroupContext.Provider>
    </div>
  );
}

export function Radio({ label, description, value, className = '', disabled, id, ref, ...props }) {
  const reactId = useId();
  const group = useContext(RadioGroupContext);
  const fieldId = id || `rd-${reactId}`;
  const bound = group
    ? {
        name: group.name,
        checked: group.value === value,
        onChange: () => group.onChange?.(value),
      }
    : {};
  return (
    <Row disabled={disabled} className={className}>
      <span className="relative flex h-5 items-center">
        <input
          ref={ref}
          id={fieldId}
          type="radio"
          value={value}
          disabled={disabled}
          className={cn(CONTROL_BASE, 'rounded-full')}
          {...bound}
          {...props}
        />
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="font-medium text-slate-800">{label}</span>}
          {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
        </span>
      )}
    </Row>
  );
}

export default Checkbox;
