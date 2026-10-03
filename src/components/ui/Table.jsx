/**
 * Table primitives — thin styled wrappers over the native table elements, not a
 * data-grid. `Table` adds the horizontal-scroll container so wide tables never
 * push the page sideways.
 *
 *   <Table>
 *     <THead><TR><TH>Name</TH><TH align="right">Calls</TH></TR></THead>
 *     <TBody>
 *       {rows.map(r => <TR key={r.id} onClick={...}><TD>{r.name}</TD><TD align="right">{r.calls}</TD></TR>)}
 *       {rows.length === 0 && <TableEmpty colSpan={2}>No results</TableEmpty>}
 *     </TBody>
 *   </Table>
 */

import React from 'react';
import { cn } from './cn.js';

export function Table({ className = '', containerClassName = '', children, ...props }) {
  return (
    <div className={cn('w-full overflow-x-auto', containerClassName)}>
      <table className={cn('w-full border-collapse text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function THead({ className = '', children, ...props }) {
  return (
    <thead className={cn('bg-slate-50', className)} {...props}>
      {children}
    </thead>
  );
}

export function TBody({ className = '', children, ...props }) {
  return (
    <tbody className={cn('divide-y divide-slate-100', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TR({ className = '', onClick, children, ...props }) {
  return (
    <tr
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer transition-colors hover:bg-slate-50', className)}
      {...props}
    >
      {children}
    </tr>
  );
}

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' };

export function TH({ align = 'left', className = '', children, ...props }) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500',
        ALIGN[align],
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({ align = 'left', className = '', children, ...props }) {
  return (
    <td className={cn('px-4 py-3 text-slate-700', ALIGN[align], className)} {...props}>
      {children}
    </td>
  );
}

export function TableEmpty({ colSpan, className = '', children }) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn('px-4 py-10 text-center text-sm text-slate-400', className)}>
        {children}
      </td>
    </tr>
  );
}

export default Table;
