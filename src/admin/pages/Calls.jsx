import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { useDebounced } from '../lib/useDebounced.js';
import { cleanParams, currency, label } from '../lib/format.js';
import { SectionHeader, DataTable, FilterBar, StatusBadge, CallDetailModal } from '../components';
import { Input } from '../../components/ui';
import { duration, relativeTime } from '../../lib/format';

// Mirrors the backend VoiceCallStatus / CallOutcome / VoiceProviderName enums (validated server-side).
const toOptions = (values) => values.map((v) => ({ value: v, label: label(v) }));
const STATUS_OPTIONS = toOptions([
  'QUEUED', 'INITIATING', 'RINGING', 'CONNECTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED',
  'NO_ANSWER', 'BUSY', 'VOICEMAIL', 'CALLBACK_SCHEDULED', 'DO_NOT_CALL', 'CANCELLED',
]);
const OUTCOME_OPTIONS = toOptions([
  'MEETING_BOOKED', 'INTERESTED', 'CALLBACK_REQUESTED', 'QUALIFIED_NO_MEETING', 'NOT_INTERESTED',
  'NOT_A_FIT', 'BUSY', 'WRONG_NUMBER', 'NO_ANSWER', 'FAILED', 'BOOKING_FAILED',
]);
const PROVIDER_OPTIONS = ['RETELL', 'BLAND', 'SYNTHFLOW'].map((v) => ({ value: v, label: v }));

export default function AdminCalls() {
  // Deep-link filters (e.g. from a user or organization view): ?organizationId=…&userId=…
  const [searchParams, setSearchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') || '';
  const userId = searchParams.get('userId') || '';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [outcome, setOutcome] = useState('');
  const [provider, setProvider] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const limit = 12;
  const debouncedSearch = useDebounced(search);
  const badRange = from && to && from > to;

  const query = useMemo(
    () => cleanParams({ page, limit, search: debouncedSearch.trim(), status, outcome, provider, from, to, organizationId, userId }),
    [page, debouncedSearch, status, outcome, provider, from, to, organizationId, userId],
  );
  const list = useAdminQuery(
    (signal) => (badRange ? Promise.resolve({ data: [], total: 0 }) : api.admin.calls.list(query, { signal })),
    [query, badRange],
  );
  const resetPage = (fn) => (v) => { fn(v); setPage(1); };

  const columns = [
    { key: 'organizationName', header: 'Organization' },
    { key: 'leadName', header: 'Lead', render: (c) => c.leadName || '—' },
    { key: 'toPhoneNumber', header: 'Number' },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} domain="call" /> },
    { key: 'outcome', header: 'Outcome', render: (c) => label(c.outcome) },
    { key: 'durationSeconds', header: 'Duration', render: (c) => duration(c.durationSeconds) },
    { key: 'costUsd', header: 'Cost', align: 'right', render: (c) => (c.costUsd === null ? '—' : currency(c.costUsd)) },
    { key: 'provider', header: 'Provider' },
    { key: 'createdAt', header: 'When', render: (c) => relativeTime(c.createdAt) },
  ];

  return (
    <div>
      <SectionHeader title="Calls" breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Calls' }]} description="Platform-wide call activity across every organization. Click a call for its transcript and timeline." />
      <FilterBar
        search={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder="Search by number, organization, lead email or company…"
        filters={[
          { key: 'status', value: status, onChange: resetPage(setStatus), options: STATUS_OPTIONS, placeholder: 'All statuses' },
          { key: 'outcome', value: outcome, onChange: resetPage(setOutcome), options: OUTCOME_OPTIONS, placeholder: 'All outcomes' },
          { key: 'provider', value: provider, onChange: resetPage(setProvider), options: PROVIDER_OPTIONS, placeholder: 'All providers' },
        ]}
        actions={
          <div className="flex items-end gap-2">
            <Input type="date" aria-label="From date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            <Input type="date" aria-label="To date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
        }
      />
      {badRange && <p className="-mt-2 mb-3 text-sm text-rose-600">“From” must be on or before “To”.</p>}
      {(organizationId || userId) && (
        <p className="-mt-2 mb-3 text-sm text-slate-600">
          Showing calls for one {organizationId ? 'organization' : 'user'} only.{' '}
          <button className="font-medium text-brand-600 hover:underline" onClick={() => { setSearchParams({}); setPage(1); }}>Show all calls</button>
        </p>
      )}
      <DataTable
        columns={columns}
        rows={list.data?.data || []}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        onRowClick={(c) => setOpenId(c.id)}
        emptyTitle={query.search || status || outcome || provider || from || to || organizationId || userId ? 'No calls match these filters' : 'No calls placed yet'}
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
      {openId && <CallDetailModal callId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
