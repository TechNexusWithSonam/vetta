import { Table, THead, TBody, TR, TH, TD, TableEmpty, Pagination, SkeletonTable, ErrorState, EmptyState } from '../../components/ui';
import { friendlyError } from '../lib/adminErrors.js';

/**
 * Standard admin list table: wraps the `ui/Table` primitives + `Pagination` +
 * `SkeletonTable` + `ErrorState`/`EmptyState` so every module shares one
 * loading/empty/error/pagination implementation.
 *
 * `columns: [{ key, header, align?, render?(row), className? }]`
 */
export function DataTable({
  columns, rows = [], rowKey = 'id', loading, error, onRetry,
  emptyTitle = 'No results', emptyHint, onRowClick,
  page, pageCount, total, pageSize, onPageChange,
  toolbar, skeletonRows = 6,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {toolbar}
      {error ? (
        <div className="p-4">
          <ErrorState error={friendlyError(error)} onRetry={onRetry} />
        </div>
      ) : loading ? (
        <div className="p-4">
          <SkeletonTable rows={skeletonRows} cols={columns.length} />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} hint={emptyHint} />
      ) : (
        <Table>
          <THead>
            <TR>
              {columns.map((c) => (
                <TH key={c.key} align={c.align}>{c.header}</TH>
              ))}
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer' : undefined}
              >
                {columns.map((c) => (
                  <TD key={c.key} align={c.align} className={c.className}>
                    {c.render ? c.render(row) : row[c.key]}
                  </TD>
                ))}
              </TR>
            ))}
          </TBody>
        </Table>
      )}
      {!loading && !error && onPageChange && rows.length > 0 && (
        <div className="flex items-center justify-end gap-4 border-t border-slate-100 px-4 py-3">
          <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

export default DataTable;
