/**
 * Select — styled native `<select>`. Native is the right call here: it's
 * keyboard- and screen-reader-correct for free and behaves properly on mobile.
 * Pass `options={[{ value, label, disabled }]}` or plain `<option>` children.
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './cn.js';
import { FieldShell } from './Input.jsx';
import { FIELD_BASE, fieldTone } from './fieldStyles.js';

export function Select({
  label,
  hint,
  error,
  required,
  optional,
  labelRight,
  options,
  placeholder,
  className = '',
  selectClassName = '',
  id,
  children,
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
          <select
            ref={ref}
            id={fieldId}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              FIELD_BASE,
              fieldTone(invalid),
              'h-11 appearance-none pl-3.5 pr-10',
              props.value === '' && placeholder ? 'text-slate-400' : '',
              selectClassName,
            )}
            {...props}
          >
            {placeholder != null && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      )}
    />
  );
}

export default Select;
