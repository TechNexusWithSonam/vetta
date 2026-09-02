import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Circle,
  XCircle
} from 'lucide-react';
import { api, ApiError } from '../api';
import { useAsync } from '../hooks/useAsync';
import { humanize, num } from '../lib/format';

const LEAD_FILTERS = [
  { value: '', label: 'All leads' },
  { value: 'NEW', label: 'New only' },
  { value: 'QUALIFIED', label: 'Qualified only' },
  { value: 'CONTACTED', label: 'Contacted only' }
];

const PAGE_LIMIT = 100; // backend caps `limit` at 100
const MAX_ASSIGN = 500; // ceiling of leads enrolled in one launch
const WORK_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri

const detectTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

const STEP_DEFS = [
  { key: 'template', label: 'Create campaign template' },
  { key: 'campaign', label: 'Create campaign' },
  { key: 'leads', label: 'Assign leads' },
  { key: 'ready', label: 'Mark ready' },
  { key: 'schedule', label: 'Configure schedule' },
  { key: 'start', label: 'Start campaign' }
];

function StepRow({ label, state, msg }) {
  const icon = {
    running: <Loader2 size={16} className="text-indigo-600 animate-spin" />,
    done: <CheckCircle2 size={16} className="text-emerald-600" />,
    error: <XCircle size={16} className="text-rose-600" />
  }[state] || <Circle size={16} className="text-slate-300" />;

  return (
    <div className="flex items-start space-x-3 py-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className={`text-sm ${state === 'error' ? 'text-rose-700 font-medium' : 'text-slate-700'}`}>{label}</p>
        {msg && <p className="text-xs text-rose-600 mt-0.5">{msg}</p>}
      </div>
    </div>
  );
}

export default function LaunchCampaign() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [leadFilter, setLeadFilter] = useState('');
  const [dailyCap, setDailyCap] = useState(200);
  const [scriptKey, setScriptKey] = useState('company_summary');
  const [timezone, setTimezone] = useState(detectTz);
  const [hoursStart, setHoursStart] = useState('09:00');
  const [hoursEnd, setHoursEnd] = useState('17:00');

  const [running, setRunning] = useState(false);
  const [stepStatus, setStepStatus] = useState({});
  const [result, setResult] = useState(null); // { ok, campaign?, error?, campaignId? }

  const leads = useAsync(async () => {
    const collected = [];
    let total = 0;
    // Page through (limit is capped at 100 server-side) up to MAX_ASSIGN.
    const maxPages = Math.ceil(MAX_ASSIGN / PAGE_LIMIT);
    for (let page = 1; page <= maxPages; page += 1) {
      const res = await api.leads.list({
        page,
        limit: PAGE_LIMIT,
        ...(leadFilter ? { status: leadFilter } : {})
      });
      total = res?.total ?? collected.length;
      const rows = res?.data ?? [];
      collected.push(...rows);
      if (rows.length < PAGE_LIMIT || collected.length >= total) break;
    }
    return { data: collected.slice(0, MAX_ASSIGN), total };
  }, [leadFilter]);

  const leadRows = leads.data?.data ?? [];
  const leadTotal = leads.data?.total ?? leadRows.length;
  const assignCount = Math.min(leadRows.length, MAX_ASSIGN);

  const canLaunch = useMemo(
    () => name.trim().length > 0 && assignCount > 0 && !running,
    [name, assignCount, running]
  );

  const runStep = async (key, fn) => {
    setStepStatus((s) => ({ ...s, [key]: { state: 'running' } }));
    try {
      const r = await fn();
      setStepStatus((s) => ({ ...s, [key]: { state: 'done' } }));
      return r;
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? Array.isArray(err.body?.message)
            ? err.body.message.join(', ')
            : err.message
          : err?.message || 'Failed';
      setStepStatus((s) => ({ ...s, [key]: { state: 'error', msg } }));
      throw err;
    }
  };

  const launch = async () => {
    setRunning(true);
    setResult(null);
    setStepStatus({});
    let campaignId = null;
    const schedule = {
      timezone,
      businessHoursStart: hoursStart,
      businessHoursEnd: hoursEnd,
      workDays: WORK_DAYS
    };

    try {
      const tpl = await runStep('template', () =>
        api.campaignTemplates.create({
          name: `${name.trim()} — template`,
          description: `Auto-created for "${name.trim()}"`,
          scriptPromptKey: scriptKey.trim() || 'company_summary',
          defaultScheduleConfig: schedule
        })
      );

      const campaign = await runStep('campaign', () =>
        api.campaigns.create({
          name: name.trim(),
          description: `Launched from the Launch Campaign screen`,
          templateId: tpl.id,
          config: {}
        })
      );
      campaignId = campaign.id;

      await runStep('leads', async () => {
        const ids = leadRows.slice(0, MAX_ASSIGN).map((l) => l.id);
        if (!ids.length) throw new Error('No leads to assign.');
        // Assign in batches so a large list stays within request limits.
        for (let i = 0; i < ids.length; i += PAGE_LIMIT) {
          await api.campaigns.assignLeads(campaign.id, ids.slice(i, i + PAGE_LIMIT));
        }
      });

      await runStep('ready', () => api.campaigns.markReady(campaign.id));

      await runStep('schedule', () =>
        api.campaigns.configureSchedule(campaign.id, { ...schedule, dailyCallLimit: Number(dailyCap) || undefined })
      );

      const started = await runStep('start', () => api.campaigns.start(campaign.id));

      setResult({ ok: true, campaign: started });
    } catch (err) {
      setResult({
        ok: false,
        campaignId,
        error:
          err instanceof ApiError
            ? Array.isArray(err.body?.message)
              ? err.body.message.join(', ')
              : err.message
            : err?.message || 'Launch failed.'
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Launch New Campaign</h2>
          <p className="text-sm text-slate-500">Create the campaign, assign leads, schedule and start it.</p>
        </div>
      </div>

      {result?.ok ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center flex flex-col items-center space-y-3">
          <CheckCircle2 size={44} className="text-emerald-600" />
          <h3 className="text-xl font-bold text-slate-900">Campaign is {humanize(result.campaign?.status || 'running')}</h3>
          <p className="text-sm text-slate-500">
            &ldquo;{result.campaign?.name}&rdquo; · {num(assignCount)} leads assigned · {dailyCap}/day cap
          </p>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => navigate('/workflow')}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
            >
              Open in Workflow
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Campaign Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enterprise SaaS — Q3 Outbound"
              disabled={running}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>

          {/* Lead selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Leads to enrol</label>
            <div className="flex items-center gap-3">
              <select
                value={leadFilter}
                onChange={(e) => setLeadFilter(e.target.value)}
                disabled={running}
                className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              >
                {LEAD_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <span className="text-sm text-slate-500">
                {leads.loading
                  ? 'Counting…'
                  : leads.error
                  ? 'Could not load leads'
                  : `${num(assignCount)} will be assigned${leadTotal > assignCount ? ` (of ${num(leadTotal)}, capped at ${MAX_ASSIGN})` : ''}`}
              </span>
            </div>
            {!leads.loading && !leads.error && assignCount === 0 && (
              <p className="text-xs text-amber-600 mt-2 flex items-center">
                <AlertCircle size={13} className="mr-1" />
                No matching leads.{' '}
                <button className="ml-1 font-semibold text-indigo-600" onClick={() => navigate('/import-leads')}>
                  Import leads
                </button>
                &nbsp;first.
              </p>
            )}
          </div>

          {/* Schedule + cap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Daily Call Cap</label>
              <input
                type="number"
                min="1"
                value={dailyCap}
                onChange={(e) => setDailyCap(e.target.value)}
                disabled={running}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={running}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Calling window start</label>
              <input
                type="time"
                value={hoursStart}
                onChange={(e) => setHoursStart(e.target.value)}
                disabled={running}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Calling window end</label>
              <input
                type="time"
                value={hoursEnd}
                onChange={(e) => setHoursEnd(e.target.value)}
                disabled={running}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Script prompt key</label>
              <input
                type="text"
                value={scriptKey}
                onChange={(e) => setScriptKey(e.target.value)}
                disabled={running}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 -mt-2">Calling days: Mon–Fri. Script key must match a prompt template (default is a built-in).</p>

          {/* Progress checklist */}
          {(running || result) && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              {STEP_DEFS.map((s) => (
                <StepRow
                  key={s.key}
                  label={s.key === 'leads' ? `Assign ${num(assignCount)} leads` : s.label}
                  state={stepStatus[s.key]?.state}
                  msg={stepStatus[s.key]?.msg}
                />
              ))}
              {result && !result.ok && (
                <div className="mt-2 flex items-start space-x-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>
                    {result.error}
                    {result.campaignId && (
                      <>
                        {' '}
                        The campaign was created —{' '}
                        <button className="font-semibold underline" onClick={() => navigate('/workflow')}>
                          finish it in Workflow
                        </button>
                        .
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={running}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={launch}
              disabled={!canLaunch}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
              <span>{running ? 'Launching…' : result && !result.ok ? 'Retry launch' : 'Launch Campaign Now'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
