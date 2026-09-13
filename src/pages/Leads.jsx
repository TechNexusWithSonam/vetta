import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Database,
  Users as UsersIcon,
  Phone,
  Loader2,
  Check,
  Pencil,
  Trash2,
  CalendarPlus,
  X
} from 'lucide-react';
import { api, ApiError } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useDncPhones } from '../hooks/useDncPhones';
import { useAuth } from '../context/useAuth';
import { canManageCalls } from '../lib/roles';
import { placeCall } from '../lib/placeCall';
import { ErrorState, EmptyState, Skeleton } from '../components/ui';
import { personName, humanize } from '../lib/format';
import BookingModal from '../components/calling/BookingModal';

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

const errText = (err, fallback) => {
  if (!(err instanceof ApiError)) return err?.message || fallback;
  return Array.isArray(err.body?.message) ? err.body.message.join(', ') : err.message;
};

/**
 * Places a REAL outbound PSTN call for one lead via `placeCall` (brief
 * generation + retry is shared with the Live Calls "Call now" panel — see
 * `src/lib/placeCall.js`). OWNER/ADMIN only; `canCall` gates that client-side
 * so a non-admin never gets as far as a 403. `isDnc` is a best-effort
 * client-side check (see `useDncPhones`) — the backend is still authoritative.
 */
function CallButton({ lead, canCall, isDnc, onDialing }) {
  const [state, setState] = useState('idle'); // idle | working | dialing | error
  const [step, setStep] = useState(''); // human label while working
  const [msg, setMsg] = useState('');

  if (!lead.phone) {
    return <span className="text-xs text-slate-400">No number</span>;
  }

  if (!canCall) {
    return (
      <span className="text-xs text-slate-400" title="Only owners/admins can place calls">
        Restricted
      </span>
    );
  }

  if (isDnc) {
    return (
      <span className="text-xs text-rose-500" title="This number is on the Do-Not-Call list">
        On DNC
      </span>
    );
  }

  const run = async () => {
    if (state === 'working') return;
    if (!window.confirm(`Place a real call to ${personName(lead)} at ${lead.phone}?`)) return;
    setState('working');
    setMsg('');
    try {
      const call = await placeCall({ leadId: lead.id, onStep: setStep });
      setState('dialing');
      onDialing?.(call);
    } catch (err) {
      setState('error');
      const noResearch =
        err instanceof ApiError && err.statusCode === 422 && /research/i.test(err.message || '');
      setMsg(
        noResearch
          ? 'Run AI Research for this lead first, then retry.'
          : errText(err, 'Could not start the call.')
      );
    }
  };

  if (state === 'dialing') {
    return (
      <span className="inline-flex items-center text-xs font-medium text-emerald-600">
        <Check size={13} className="mr-1" /> Dialing…
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={run}
        disabled={state === 'working'}
        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {state === 'working' ? (
          <Loader2 size={13} className="mr-1 animate-spin" />
        ) : (
          <Phone size={13} className="mr-1" />
        )}
        {state === 'working' ? 'Working…' : state === 'error' ? 'Retry call' : 'Call now'}
      </button>
      {state === 'working' && step && (
        <span className="text-xs text-slate-500 max-w-[12rem]">{step}</span>
      )}
      {state === 'error' && <span className="text-xs text-rose-600 max-w-[12rem]">{msg}</span>}
    </div>
  );
}

const EDIT_TEXT_FIELDS = [
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['email', 'Email'],
  ['company', 'Company'],
  ['title', 'Title'],
  ['phone', 'Phone'],
  ['linkedinUrl', 'LinkedIn URL']
];

const inputClass =
  'w-full border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

/** Modal for editing one lead via `PATCH /leads/:id`. Only changed fields are sent. */
function LeadEditModal({ lead, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    firstName: lead.firstName ?? '',
    lastName: lead.lastName ?? '',
    email: lead.email ?? '',
    company: lead.company ?? '',
    title: lead.title ?? '',
    phone: lead.phone ?? '',
    linkedinUrl: lead.linkedinUrl ?? '',
    status: lead.status ?? 'NEW',
    source: lead.source ?? 'MANUAL'
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError('');

    const payload = {};
    for (const [key] of EDIT_TEXT_FIELDS) {
      const next = form[key].trim();
      if (next !== (lead[key] ?? '')) payload[key] = next || null;
    }
    if (form.status !== lead.status) payload.status = form.status;
    if (form.source !== lead.source) payload.source = form.source;

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      await api.leads.update(lead.id, payload);
      onSaved();
    } catch (err) {
      setError(errText(err, 'Could not save changes.'));
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Edit lead</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {EDIT_TEXT_FIELDS.map(([key, label]) => (
            <label key={key} className="text-sm">
              <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
              <input
                type={key === 'email' ? 'email' : 'text'}
                value={form[key]}
                onChange={set(key)}
                className={inputClass}
              />
            </label>
          ))}
          <label className="text-sm">
            <span className="block text-xs font-medium text-slate-600 mb-1">Status</span>
            <select value={form.status} onChange={set('status')} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {humanize(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs font-medium text-slate-600 mb-1">Source</span>
            <select value={form.source} onChange={set('source')} className={inputClass}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {humanize(s)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="px-6 pb-1 text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-1"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Leads() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = canManageCalls(user);
  const { phones: dncPhones } = useDncPhones();
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

  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [bookingLead, setBookingLead] = useState(null);

  const removeLead = async (lead) => {
    if (!window.confirm(`Delete ${personName(lead)}? This can't be undone from here.`)) return;
    setDeletingId(lead.id);
    try {
      await api.leads.remove(lead.id);
      // Stepping back a page re-runs the query; otherwise reload in place.
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else leads.reload();
    } catch (err) {
      alert(errText(err, 'Could not delete this lead.'));
    } finally {
      setDeletingId(null);
    }
  };

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
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {leads.loading &&
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 6 }).map((__, j) => (
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
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <CallButton
                                lead={lead}
                                canCall={canManage}
                                isDnc={Boolean(lead.phone && dncPhones.has(lead.phone))}
                                onDialing={(call) =>
                                  navigate('/app/live-calls', { state: { callId: call.id } })
                                }
                              />
                              {canManage && (
                                <button
                                  onClick={() => setBookingLead(lead)}
                                  title="Book meeting"
                                  className="text-slate-400 hover:text-indigo-600 transition-colors mt-0.5"
                                >
                                  <CalendarPlus size={15} />
                                </button>
                              )}
                              <button
                                onClick={() => setEditing(lead)}
                                title="Edit lead"
                                className="text-slate-400 hover:text-indigo-600 transition-colors mt-0.5"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => removeLead(lead)}
                                disabled={deletingId === lead.id}
                                title="Delete lead"
                                className="text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50 mt-0.5"
                              >
                                {deletingId === lead.id ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            </div>
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

      {editing && (
        <LeadEditModal
          lead={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            leads.reload();
          }}
        />
      )}

      <BookingModal
        open={Boolean(bookingLead)}
        onClose={() => setBookingLead(null)}
        lead={bookingLead || {}}
      />
    </div>
  );
}
