/**
 * Card — the standard white surface. Matches what every page already draws by
 * hand: `bg-white border border-slate-200 rounded-xl shadow-card`.
 *
 *   <Card>
 *     <CardHeader title="Campaigns" actions={<Button size="sm">New</Button>} />
 *     <CardBody> … </CardBody>
 *     <CardFooter> … </CardFooter>
 *   </Card>
 *
 * `padded` applies body padding directly on <Card> for the common single-block
 * case where a header/body/footer split isn't needed.
 */

import React from 'react';
import { cn } from './cn.js';

export function Card({ as, interactive = false, padded = false, className = '', children, ...props }) {
  const Comp = as || 'div';
  return (
    <Comp
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-card',
        interactive && 'transition-shadow transition-colors hover:border-slate-300 hover:shadow-card-hover',
        padded && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function CardHeader({ title, description, actions, className = '', children, ...props }) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4', className)}
      {...props}
    >
      {children ?? (
        <div className="min-w-0">
          {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      )}
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className = '', children, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3.5', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
