import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Database, Users as UsersIcon } from 'lucide-react';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, EmptyState, Skeleton } from '../components/ui';
import { personName, humanize } from '../lib/format';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'ARCHIVED'];
const SOURCES = ['MANUAL', 'CSV_IMPORT', 'API', 'LINKEDIN', 'WEBSITE', 'REFERRAL', 'OTHER'];
const PAGE_SIZE = 20;

const STATUS_STYLES = {
  NEW: 'bg-slate-100 text-slate-600 border-slate-200',
  CONTACTED: 'bg-blue-50 text-blue-700 border-blue-200',
  QUALIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UNQUALIFIED: 'bg-amber-50 text-amber-700 border-amber-200',
  CONVERTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200'
};

export default function Leads() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the free-text search; snap back to page 1 on any new term.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const setStatusFilter = (value) => {
    setStatus(value);
    setPage(1);
  };
  const setSourceFilter = (value) => {
    setSource(value);
    setPage(1);
  };

  const query = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(source ? { source } : {})
    }),
    [page, search, status, source]
  );

  const leads = useAsync(() => api.leads.list(query), [JSON.stringify(query)]);

  const rows = leads.data?.data ?? [];
  const total = leads.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search leads, companies, or titles..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="text-sm text-slate-500">
          {leads.loading ? 'Loading…' : `${total.toLocaleString()} lead${total === 1 ? '' : 's'}`}
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left Sidebar: Filters */}
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center space-x-2">
            <Filter size={18} className="text-slate-600" />
            <h2 className="font-semibold text-slate-800">Filters</h2>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {humanize(s)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All sources</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {humanize(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                setSearchInput('');
                setStatus('');
                setSource('');
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Right Area: Data Grid */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {leads.error ? (
            <div className="p-6">
              <ErrorState error={leads.error} onRetry={leads.reload} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-4">Prospect</th>
                      <th className="px-6 py-4">Company &amp; Title</th>
                      <th className="px-6 py-4">Direct Dial</th>
                      <th className="px-6 py-4">Source</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {leads.loading &&
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 5 }).map((__, j) => (
                            <td key={j} className="px-6 py-4">
                              <Skeleton className="h-4 w-24" />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {!leads.loading &&
                      rows.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{personName(lead)}</div>
                            <div className="text-xs text-slate-500">{lead.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">{lead.company || '—'}</div>
                            <div className="text-xs text-slate-500">{lead.title || '—'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-700">{lead.phone || '—'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <Database size={12} className="mr-1" />
                              {humanize(lead.source) || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                STATUS_STYLES[lead.status] || STATUS_STYLES.NEW
                              }`}
                            >
                              {humanize(lead.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {!leads.loading && rows.length === 0 && (
                  <EmptyState
                    icon={UsersIcon}
                    title="No leads match these filters"
                    hint="Import leads or adjust the filters on the left."
                  />
                )}
              </div>

              {/* Pagination Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
                <div>
                  Showing {rangeStart} to {rangeEnd} of {total.toLocaleString()} leads
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || leads.loading}
                    className="px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 bg-white"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || leads.loading}
                    className="px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 bg-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
