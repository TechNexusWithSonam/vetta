/**
 * Breadcrumb — trail of links ending in the current page.
 *
 *   <Breadcrumb
 *     items={[
 *       { label: 'Campaigns', to: '/app/campaigns' },
 *       { label: 'Q3 Outbound' },        // last item: current page, no link
 *     ]}
 *   />
 *
 * Router-agnostic: pass `linkComponent={Link}` to render items as router links,
 * otherwise `to` renders a plain `<a href>`.
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from './cn.js';

export function Breadcrumb({ items = [], linkComponent, className = '' }) {
  const Link = linkComponent || 'a';
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          const linkProps = linkComponent ? { to: item.to } : { href: item.to };
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.to && !last ? (
                <Link
                  {...linkProps}
                  className="rounded font-medium text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(last ? 'font-semibold text-slate-800' : 'text-slate-500')}
                  aria-current={last ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight size={14} className="text-slate-300" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
