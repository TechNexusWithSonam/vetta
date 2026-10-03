/**
 * /admin/calendar — booking availability for any organization: slot length,
 * notice, buffers, weekly working hours and holidays, plus a live preview.
 * Saves to the same org-default settings that tenant's booking modal reads
 * (`/calendar/availability`), so the preview is exactly what its users get.
 */
import { useCallback, useMemo, useState } from 'react';
import { CalendarCheck2, CalendarX2, Plus, Trash2, Globe } from 'lucide-react';
import { api } from '../../api';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { adminErrorMessage, friendlyError } from '../lib/adminErrors.js';
import { SectionHeader, OrganizationPicker } from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import SlotPicker from '../../components/calling/SlotPicker.jsx';
import {
  Input, Select, Checkbox, Button, Badge, ErrorState, LoadingState, EmptyState, useToast,
} from '../../components/ui';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const TIMEZONES = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
const ORG_KEY = 'vetta.admin.calendarOrgId';

// Monday first for display; dayOfWeek stays 0=Sunday..6=Saturday as the API expects.
const DAYS = [
  [1, 'Monday'], [2, 'Tuesday'], [3, 'Wednesday'], [4, 'Thursday'], [5, 'Friday'], [6, 'Saturday'], [0, 'Sunday'],
];

const minuteOptions = (values) => values.map((v) => ({
  value: String(v),
  label: v === 0 ? 'None' : v < 60 ? `${v} min` : v % 1440 === 0 ? `${v / 1440} day${v > 1440 ? 's' : ''}` : `${v / 60} hour${v > 60 ? 's' : ''}`,
}));
const SLOT_OPTIONS = minuteOptions([15, 20, 30, 45, 60, 90, 120]);
const BUFFER_OPTIONS = minuteOptions([0, 5, 10, 15, 30, 60]);
const NOTICE_OPTIONS = minuteOptions([0, 30, 60, 120, 240, 1440, 2880]);

const readStoredOrg = () => {
  try { return localStorage.getItem(ORG_KEY) || ''; } catch { return ''; }
};
const storeOrg = (id) => {
  try { localStorage.setItem(ORG_KEY, id); } catch { /* per-viewer convenience only */ }
};

/** Settings from the API → editable form. A default (unsaved) rule's UTC zone is replaced by the admin's own. */
function toForm(settings) {
  const { rule } = settings;
  return {
    timezone: rule.isDefault ? BROWSER_TZ : rule.timezone,
    slotDurationMinutes: rule.slotDurationMinutes,
    bufferBeforeMinutes: rule.bufferBeforeMinutes,
    bufferAfterMinutes: rule.bufferAfterMinutes,
    minNoticeMinutes: rule.minNoticeMinutes,
    maxHorizonDays: rule.maxHorizonDays,
    days: settings.workingHours.map((d) => ({ ...d, intervals: d.intervals.map((i) => ({ ...i })) })),
  };
}

function validate(form) {
  if (!form.timezone.trim()) return 'Choose a timezone.';
  if (TIMEZONES.length && !TIMEZONES.includes(form.timezone.trim()) && form.timezone.trim() !== 'UTC') {
    return `“${form.timezone}” isn’t a known timezone. Pick one from the list.`;
  }
  const horizon = Number(form.maxHorizonDays);
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 365) return 'Booking window must be 1–365 days.';
  for (const day of form.days) {
    if (!day.isActive) continue;
    const name = DAYS.find(([d]) => d === day.dayOfWeek)[1];
    if (day.intervals.length === 0) return `${name} is on but has no hours.`;
    for (const i of day.intervals) {
      if (!i.start || !i.end || i.start >= i.end) return `${name}: each range must start before it ends.`;
    }
  }
  return null;
}

function DayRow({ day, label, onChange, disabled }) {
  const setInterval = (idx, key, value) =>
    onChange({ ...day, intervals: day.intervals.map((i, n) => (n === idx ? { ...i, [key]: value } : i)) });

  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start">
      <div className="w-36 shrink-0 pt-2">
        <Checkbox
          label={label}
          checked={day.isActive}
          disabled={disabled}
          onChange={(e) => {
            const isActive = e.target.checked;
            onChange({
              ...day,
              isActive,
              intervals: isActive && day.intervals.length === 0 ? [{ start: '09:00', end: '18:00' }] : day.intervals,
            });
          }}
        />
      </div>
      {day.isActive ? (
        <div className="flex-1 space-y-2">
          {day.intervals.map((interval, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="time"
                aria-label={`${label} start`}
                value={interval.start}
                disabled={disabled}
                onChange={(e) => setInterval(idx, 'start', e.target.value)}
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
              />
              <span className="text-sm text-slate-400">to</span>
              <input
                type="time"
                aria-label={`${label} end`}
                value={interval.end}
                disabled={disabled}
                onChange={(e) => setInterval(idx, 'end', e.target.value)}
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
              />
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  iconLeft={Trash2}
                  aria-label={`Remove ${label} range`}
                  onClick={() => onChange({ ...day, intervals: day.intervals.filter((_, n) => n !== idx) })}
                />
              )}
            </div>
          ))}
          {!disabled && day.intervals.length < 8 && (
            <Button
              variant="link"
              iconLeft={Plus}
              onClick={() => {
                const last = day.intervals[day.intervals.length - 1];
                onChange({ ...day, intervals: [...day.intervals, last ? { start: last.end, end: last.end < '23:00' ? '23:00' : '23:59' } : { start: '09:00', end: '18:00' }] });
              }}
            >
              Add hours
            </Button>
          )}
        </div>
      ) : (
        <p className="pt-2 text-sm text-slate-400">Unavailable</p>
      )}
    </div>
  );
}

function HolidaysCard({ orgId, holidays, canManage, onChanged }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [busy, setBusy] = useState(null);

  const add = async () => {
    if (!name.trim() || !date) return;
    setBusy('add');
    try {
      await api.admin.calendar.addHoliday(orgId, { name: name.trim(), date, isRecurringYearly: recurring });
      setName(''); setDate(''); setRecurring(false);
      toast.success('Holiday added');
      onChanged();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Couldn’t add the holiday'));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id) => {
    setBusy(id);
    try {
      await api.admin.calendar.removeHoliday(orgId, id);
      toast.success('Holiday removed');
      onChanged();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Couldn’t remove the holiday'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-slate-800">Holidays</h3>
      <p className="mt-1 mb-4 text-sm text-slate-500">No slots are offered on these dates.</p>
      {holidays.length === 0 ? (
        <p className="text-sm text-slate-400">No holidays added.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {holidays.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700">{h.name}</p>
                <p className="text-xs text-slate-500">{h.date}{h.isRecurringYearly ? ' · every year' : ''}</p>
              </div>
              {canManage && (
                <Button variant="ghost" size="sm" iconOnly iconLeft={Trash2} aria-label={`Remove ${h.name}`} loading={busy === h.id} onClick={() => remove(h.id)} />
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <Input label="Name" placeholder="e.g. Diwali" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Checkbox label="Repeats every year" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          <Button size="sm" iconLeft={Plus} onClick={add} loading={busy === 'add'} disabled={!name.trim() || !date}>Add holiday</Button>
        </div>
      )}
    </section>
  );
}

/** `Sat, 10 Oct · 10:00–13:00` in the org's scheduling timezone. */
function formatWindow(w, timeZone) {
  const day = new Intl.DateTimeFormat(undefined, { timeZone, weekday: 'short', day: 'numeric', month: 'short' });
  const time = new Intl.DateTimeFormat(undefined, { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  return `${day.format(new Date(w.startTime))} · ${time.format(new Date(w.startTime))}–${time.format(new Date(w.endTime))}`;
}

function ExtraAvailabilityCard({ orgId, windows, timeZone, canManage, onChanged }) {
  const toast = useToast();
  const [date, setDate] = useState('');
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('13:00');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(null);
  const invalid = !date || !start || !end || start >= end;

  const add = async () => {
    if (invalid) return;
    setBusy('add');
    try {
      await api.admin.calendar.addExtraWindow(orgId, {
        date, start, end, note: note.trim() || undefined, timezone: BROWSER_TZ,
      });
      setDate(''); setNote('');
      toast.success('Extra availability added — users can book these slots now');
      onChanged();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Couldn’t add extra availability'));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id) => {
    setBusy(id);
    try {
      await api.admin.calendar.removeExtraWindow(orgId, id);
      toast.success('Extra availability removed');
      onChanged();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Couldn’t remove it'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-slate-800">Extra availability</h3>
      <p className="mt-1 mb-4 text-sm text-slate-500">
        Open extra time on a specific date, even outside the weekly hours or on a holiday. Times are in {timeZone}.
      </p>
      {windows.length === 0 ? (
        <p className="text-sm text-slate-400">No extra availability added.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {windows.map((w) => (
            <li key={w.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">{formatWindow(w, timeZone)}</p>
                {w.note && <p className="truncate text-xs text-slate-500">{w.note}</p>}
              </div>
              {canManage && (
                <Button variant="ghost" size="sm" iconOnly iconLeft={Trash2} aria-label="Remove extra availability" loading={busy === w.id} onClick={() => remove(w.id)} />
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <Input label="Date" type="date" min={new Date().toLocaleDateString('en-CA')} value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="From" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="To" type="time" value={end} onChange={(e) => setEnd(e.target.value)} error={start && end && start >= end ? 'Must be after start' : undefined} />
          </div>
          <Input label="Note" optional placeholder="e.g. Weekend demo slots" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} />
          <Button size="sm" iconLeft={Plus} onClick={add} loading={busy === 'add'} disabled={invalid}>Add extra availability</Button>
        </div>
      )}
    </section>
  );
}

function AvailabilityEditor({ orgId, settings, onSaved, onRefresh }) {
  const { can } = useAdminAccess();
  const canManage = can(P.ORGANIZATIONS_MANAGE);
  const toast = useToast();
  const initial = useMemo(() => toForm(settings), [settings]);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const isDefault = settings.rule.isDefault || settings.workingHoursIsDefault;
  const dirty = isDefault || JSON.stringify(form) !== JSON.stringify(initial);
  const problem = validate(form);
  const set = (key, numeric) => (e) => setForm((f) => ({ ...f, [key]: numeric ? Number(e.target.value) : e.target.value }));

  const save = async () => {
    if (problem) { toast.error(problem); return; }
    setSaving(true);
    try {
      const saved = await api.admin.calendar.update(orgId, {
        rule: {
          timezone: form.timezone.trim(),
          slotDurationMinutes: form.slotDurationMinutes,
          bufferBeforeMinutes: form.bufferBeforeMinutes,
          bufferAfterMinutes: form.bufferAfterMinutes,
          minNoticeMinutes: form.minNoticeMinutes,
          maxHorizonDays: Number(form.maxHorizonDays),
        },
        days: form.days.map((d) => ({ dayOfWeek: d.dayOfWeek, isActive: d.isActive, intervals: d.isActive ? d.intervals : [] })),
      });
      toast.success('Availability saved — users of this organization now see these slots');
      onSaved(saved);
      setPreviewKey((k) => k + 1);
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Couldn’t save availability'));
    } finally {
      setSaving(false);
    }
  };

  const loadPreview = useCallback(
    (params) => api.admin.calendar.availability(orgId, params),
    [orgId],
  );
  const activeConnection = settings.connections.find((c) => c.status === 'ACTIVE');

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6 min-w-0">
        {isDefault && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Not saved yet. This organization is on the defaults: Monday–Friday, 9:00–18:00 in each viewer’s own timezone.
            Save to fix the hours to the timezone below.
          </div>
        )}

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Booking rules</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Timezone"
                icon={Globe}
                list="admin-calendar-timezones"
                value={form.timezone}
                onChange={set('timezone')}
                disabled={!canManage}
                hint="Working hours below are in this timezone. Users see slots converted to their own."
              />
              <datalist id="admin-calendar-timezones">
                {TIMEZONES.map((tz) => <option key={tz} value={tz} />)}
              </datalist>
            </div>
            <Select label="Meeting length" options={SLOT_OPTIONS} value={String(form.slotDurationMinutes)} onChange={set('slotDurationMinutes', true)} disabled={!canManage} />
            <Select label="Minimum notice" options={NOTICE_OPTIONS} value={String(form.minNoticeMinutes)} onChange={set('minNoticeMinutes', true)} disabled={!canManage} hint="Earliest a meeting can start from now" />
            <Select label="Buffer before" options={BUFFER_OPTIONS} value={String(form.bufferBeforeMinutes)} onChange={set('bufferBeforeMinutes', true)} disabled={!canManage} hint="Free time kept before existing meetings" />
            <Select label="Buffer after" options={BUFFER_OPTIONS} value={String(form.bufferAfterMinutes)} onChange={set('bufferAfterMinutes', true)} disabled={!canManage} hint="Free time kept after existing meetings" />
            <Input label="Booking window (days)" type="number" min={1} max={365} value={form.maxHorizonDays} onChange={set('maxHorizonDays')} disabled={!canManage} hint="How far ahead users can book" />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-800">Weekly working hours</h3>
          <p className="mt-1 text-sm text-slate-500">Slots are only offered inside these hours.</p>
          <div className="mt-2 divide-y divide-slate-100">
            {DAYS.map(([dayOfWeek, label]) => {
              const day = form.days.find((d) => d.dayOfWeek === dayOfWeek);
              return (
                <DayRow
                  key={dayOfWeek}
                  day={day}
                  label={label}
                  disabled={!canManage}
                  onChange={(next) => setForm((f) => ({ ...f, days: f.days.map((d) => (d.dayOfWeek === dayOfWeek ? next : d)) }))}
                />
              );
            })}
          </div>
        </section>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={save} loading={saving} disabled={!dirty || !!problem}>Save availability</Button>
            {!isDefault && dirty && <Button variant="secondary" onClick={() => setForm(initial)} disabled={saving}>Discard</Button>}
            {problem && <span className="text-sm text-rose-600">{problem}</span>}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Preview</h3>
              <p className="mt-1 text-xs text-slate-500">
                The slots this organization’s users see, from the <strong>saved</strong> settings. Times in your timezone ({BROWSER_TZ}).
              </p>
            </div>
          </div>
          {activeConnection ? (
            <p className="mb-4 flex items-center gap-1.5 text-xs text-emerald-700">
              <CalendarCheck2 size={14} /> {activeConnection.provider} calendar connected{activeConnection.externalAccountEmail ? ` · ${activeConnection.externalAccountEmail}` : ''}: busy times are excluded
            </p>
          ) : (
            <p className="mb-4 flex items-start gap-1.5 text-xs text-amber-700">
              <CalendarX2 size={14} className="mt-0.5 shrink-0" /> No calendar connected, so users can’t book yet. The preview shows working-hours slots without calendar conflicts.
            </p>
          )}
          <SlotPicker
            key={previewKey}
            durationMinutes={settings.rule.slotDurationMinutes}
            timezone={BROWSER_TZ}
            maxHorizonDays={settings.rule.maxHorizonDays}
            selected={null}
            onSelect={() => {}}
            reloadKey={previewKey}
            loadAvailability={loadPreview}
            extraWindows={settings.extraWindows}
          />
        </section>

        <ExtraAvailabilityCard
          orgId={orgId}
          windows={settings.extraWindows}
          timeZone={settings.rule.isDefault ? BROWSER_TZ : settings.rule.timezone}
          canManage={canManage}
          onChanged={() => { onRefresh(); setPreviewKey((k) => k + 1); }}
        />

        <HolidaysCard
          orgId={orgId}
          holidays={settings.holidays}
          canManage={canManage}
          onChanged={() => { onRefresh(); setPreviewKey((k) => k + 1); }}
        />
      </div>
    </div>
  );
}

export default function AdminCalendarAvailability() {
  const [orgId, setOrgId] = useState(readStoredOrg);
  const [saved, setSaved] = useState(null);
  const q = useAdminQuery((signal) => (orgId ? api.admin.calendar.get(orgId, { signal }) : Promise.resolve(null)), [orgId]);
  const settings = saved?.organization?.id === orgId ? saved : q.data;

  const pickOrg = (id) => {
    setOrgId(id);
    setSaved(null);
    if (id) storeOrg(id);
  };

  return (
    <div>
      <SectionHeader
        title="Calendar & Booking"
        description="Set when each organization’s users can book meetings from calls."
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Calendar & Booking' }]}
      />

      <div className="mb-6 max-w-xl bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <OrganizationPicker value={orgId} onChange={pickOrg} />
        {settings?.organization && (
          <p className="mt-3 text-sm text-slate-600">
            Editing <span className="font-semibold text-slate-800">{settings.organization.name}</span>
            {(settings.rule.isDefault || settings.workingHoursIsDefault) && <Badge className="ml-2" tone="warning">Defaults</Badge>}
          </p>
        )}
      </div>

      {!orgId ? (
        <EmptyState icon={CalendarCheck2} title="Choose an organization" hint="Search above to edit its booking availability." />
      ) : q.loading && !settings ? (
        <LoadingState label="Loading availability…" />
      ) : q.error && !settings ? (
        <ErrorState error={friendlyError(q.error)} onRetry={q.reload} />
      ) : settings ? (
        <AvailabilityEditor
          key={`${orgId}:${JSON.stringify(settings.rule)}:${JSON.stringify(settings.workingHours)}`}
          orgId={orgId}
          settings={settings}
          onSaved={setSaved}
          // Refetch in place: a q.reload() would unmount the editor and drop unsaved hour edits.
          onRefresh={() => api.admin.calendar.get(orgId).then(setSaved, q.reload)}
        />
      ) : null}
    </div>
  );
}
