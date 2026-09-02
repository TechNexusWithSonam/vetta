import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, RefreshCcw, Plug, Loader2 } from 'lucide-react';
import { api, ApiError } from '../api';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, EmptyState, Skeleton } from '../components/ui';
import { humanize, relativeTime, num } from '../lib/format';

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CONNECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ERROR: 'bg-rose-50 text-rose-700 border-rose-200',
  DISABLED: 'bg-slate-100 text-slate-500 border-slate-200',
  DISCONNECTED: 'bg-slate-100 text-slate-500 border-slate-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200'
};

const PROVIDER_AVATAR = {
  HUBSPOT: 'bg-orange-500',
  AIRTABLE: 'bg-yellow-500',
  SALESFORCE: 'bg-sky-500',
  GOOGLE: 'bg-blue-600',
  CALENDLY: 'bg-indigo-600',
  OUTLOOK: 'bg-blue-500'
};

function ConnectionCard({ conn, kind, onChanged }) {
  const [busy, setBusy] = useState('');
  const status = conn.status || 'PENDING';
  const isActive = status === 'ACTIVE' || status === 'CONNECTED';

  const svc = kind === 'crm' ? api.crm.connections : api.calendar.connections;

  const act = async (name, fn) => {
    setBusy(name);
    try {
      await fn();
      onChanged();
    } catch (err) {
      alert(err instanceof ApiError ? `${humanize(name)} failed: ${err.message}` : `${humanize(name)} failed.`);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-xl text-white font-bold text-lg flex items-center justify-center shadow-sm ${
                PROVIDER_AVATAR[conn.provider] || 'bg-slate-700'
              }`}
            >
              {String(conn.provider || '?').slice(0, 2)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{humanize(conn.provider)}</h3>
              <span className="text-xs text-slate-500 font-medium">
                {kind === 'crm' ? 'CRM & Pipeline' : 'Scheduling'}
              </span>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
              STATUS_STYLES[status] || STATUS_STYLES.PENDING
            }`}
          >
            {status === 'ERROR' ? <AlertTriangle size={12} className="mr-1" /> : <CheckCircle2 size={12} className="mr-1" />}
            {humanize(status)}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          {conn.lastError ||
            `Connected ${relativeTime(conn.createdAt)}${
              conn.lastTestedAt ? ` · last tested ${relativeTime(conn.lastTestedAt)}` : ''
            }`}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => act('test', () => svc.test(conn.id))}
          disabled={Boolean(busy)}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center disabled:opacity-50"
        >
          {busy === 'test' ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCcw size={14} className="mr-1" />}
          Test
        </button>
        <button
          onClick={() =>
            act(isActive ? 'disable' : 'enable', () => (isActive ? svc.disable(conn.id) : svc.enable(conn.id)))
          }
          disabled={Boolean(busy)}
          className={`text-sm font-semibold flex items-center disabled:opacity-50 ${
            isActive ? 'text-rose-600 hover:text-rose-800' : 'text-indigo-600 hover:text-indigo-800'
          }`}
        >
          {(busy === 'enable' || busy === 'disable') && <Loader2 size={14} className="mr-1 animate-spin" />}
          {isActive ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  );
}

export default function Integrations() {
  const crm = useAsync(() => api.crm.connections.list(), []);
  const calendar = useAsync(() => api.calendar.connections.list(), []);
  const syncStats = useAsync(() => api.crm.sync.stats().catch(() => null), []);

  const crmRows = Array.isArray(crm.data) ? crm.data : crm.data?.data ?? [];
  const calRows = Array.isArray(calendar.data) ? calendar.data : calendar.data?.data ?? [];
  const loading = crm.loading || calendar.loading;
  const error = crm.error || calendar.error;
  const empty = !loading && !error && crmRows.length === 0 && calRows.length === 0;

  const reloadAll = () => {
    crm.reload();
    calendar.reload();
    syncStats.reload();
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Integrations</h2>
          <p className="text-sm text-slate-500 mt-1">Connected CRMs and calendars.</p>
        </div>
        <div className="flex items-center space-x-4">
          {syncStats.data && (
            <span className="text-xs text-slate-500">
              {num(syncStats.data.contactsSynced)} contacts · {num(syncStats.data.dealsSynced)} deals synced
            </span>
          )}
          <button
            onClick={reloadAll}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && <ErrorState error={error} onRetry={reloadAll} />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : empty ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <EmptyState
            icon={Plug}
            title="No integrations connected"
            hint="Connect a CRM (HubSpot, Airtable) or calendar (Google, Calendly) to sync leads, meetings and call outcomes."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
          {crmRows.map((c) => (
            <ConnectionCard key={c.id} conn={c} kind="crm" onChanged={reloadAll} />
          ))}
          {calRows.map((c) => (
            <ConnectionCard key={c.id} conn={c} kind="calendar" onChanged={reloadAll} />
          ))}
        </div>
      )}
    </div>
  );
}
