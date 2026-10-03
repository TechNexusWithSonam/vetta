/**
 * Pagination — page numbers with Prev / Next. Controlled: give it `page`,
 * `pageCount` (or `total` + `pageSize`) and `onPageChange`.
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './cn.js';

/** [1, '…', 4, 5, 6, '…', 20] — always shows first/last and a window around current. */
function pageItems(page, pageCount, siblings = 1) {
  const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
  if (pageCount <= 7) return range(1, pageCount);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const items = [];
  items.push(1);
  if (left > 2) items.push('left-ellipsis');
  items.push(...range(Math.max(left, 2), Math.min(right, pageCount - 1)));
  if (right < pageCount - 1) items.push('right-ellipsis');
  if (pageCount > 1) items.push(pageCount);
  return items;
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  className = '',
  showSummary = true,
}) {
  const count = pageCount ?? (total != null && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1);
  if (count <= 1 && !showSummary) return null;

  const go = (p) => {
    const next = Math.min(Math.max(1, p), count);
    if (next !== page) onPageChange?.(next);
  };

  const btn =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav
      className={cn('flex items-center justify-between gap-4', className)}
      aria-label="Pagination"
    >
      {showSummary && (
        <p className="hidden text-sm text-slate-500 sm:block">
          {total != null && pageSize ? (
            <>
              <span className="font-medium text-slate-700">
                {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)}
              </span>{' '}
              of <span className="font-medium text-slate-700">{total.toLocaleString()}</span>
            </>
          ) : (
            <>
              Page <span className="font-medium text-slate-700">{page}</span> of {count}
            </>
          )}
        </p>
      )}

      <div className="flex items-center gap-1">
        <button className={cn(btn, 'text-slate-600 hover:bg-slate-100')} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        {pageItems(page, count).map((item, i) =>
          typeof item === 'string' ? (
            <span key={item + i} className="px-1 text-slate-400" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => go(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                btn,
                item === page
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {item}
            </button>
          ),
        )}
        <button className={cn(btn, 'text-slate-600 hover:bg-slate-100')} onClick={() => go(page + 1)} disabled={page >= count} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
