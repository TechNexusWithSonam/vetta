/**
 * Book a meeting for a lead via `calendar.meetings.create`. Lead details (and,
 * when opened from a call, its AI summary) are shown read-only — nothing
 * already known is asked for again. Slots come straight from `SlotPicker`
 * (backed by `calendar.availability`); after a successful booking, only
 * fields the API actually returned are shown (no invented meeting links).
 * `bookingRequestId` makes the create call idempotent, and the confirm button
 * is disabled while saving, so a double click can't create two meetings.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Sparkles,
  User,
  Video,
} from 'lucide-react';
import { api, ApiError } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Modal, Button, Select, Input, Textarea, Badge, ErrorState, useToast, cn } from '../ui';
import { personName, dateTime, humanize } from '../../lib/format';
import { googleCalendarAddUrl } from '../../lib/googleCalendar';
import SlotPicker from './SlotPicker';

const MEETING_TYPES = ['Discovery Call', 'Product Demo', 'Follow-up', 'Consultation', 'Custom'];
const DURATIONS = [15, 30, 45, 60];
const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

function newRequestId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `book-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function BookingModal({ open, onClose, lead, callSummary, onBooked }) {
  const toast = useToast();
  const safeLead = lead || {};

  const connections = useAsync(() => (open ? api.calendar.connections.list() : Promise.resolve([])), [open]);
  const rule = useAsync(
    () => (open ? api.calendar.settings.getAvailabilityRule().catch(() => null) : Promise.resolve(null)),
    [open],
  );

  const connectionRows = useMemo(() => {
    const rows = Array.isArray(connections.data) ? connections.data : connections.data?.data ?? [];
    return rows.filter((c) => c.status === 'ACTIVE' || c.status === 'CONNECTED');
  }, [connections.data]);

  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [connectionId, setConnectionId] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(null);
  const requestIdRef = useRef(newRequestId());

  // Fresh form + fresh idempotency key each time the modal opens.
  useEffect(() => {
    if (!open) return;
    requestIdRef.current = newRequestId();
    setMeetingType(MEETING_TYPES[0]);
    setCustomTitle('');
    setConnectionId('');
    setDescription('');
    setSelectedSlot(null);
    setReloadKey(0);
    setSaving(false);
    setError('');
    setBooked(null);
  }, [open]);

  useEffect(() => {
    if (rule.data?.slotDurationMinutes) setDurationMinutes(rule.data.slotDurationMinutes);
  }, [rule.data]);

  useEffect(() => {
    if (!connectionId && connectionRows.length > 0) setConnectionId(connectionRows[0].id);
  }, [connectionRows, connectionId]);

  const title = meetingType === 'Custom' ? customTitle.trim() || 'Meeting' : meetingType;
  const noCalendar = !connections.loading && connectionRows.length === 0;

  const close = () => {
    if (saving) return;
    onClose();
  };

  const submit = async () => {
    if (saving || !selectedSlot || noCalendar) return;
    setSaving(true);
    setError('');
    try {
      const meeting = await api.calendar.meetings.create({
        leadId: safeLead.id,
        startTimeIso: selectedSlot.start,
        durationMinutes,
        connectionId: connectionId || undefined,
        title,
        description: description.trim() || undefined,
        timezone: BROWSER_TZ,
        attendeeEmail: safeLead.email || undefined,
        attendeeName: personName(safeLead) !== '—' ? personName(safeLead) : undefined,
        bookingRequestId: requestIdRef.current,
      });
      setBooked(meeting);
      toast.success('Meeting booked.');
      onBooked?.(meeting);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setError('That time was just taken — pick another slot.');
        setSelectedSlot(null);
        setReloadKey((k) => k + 1);
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not book this meeting.');
      }
    } finally {
      setSaving(false);
    }
  };

  const meetingLink = booked?.meetingUrl || booked?.joinUrl || booked?.location;

  const copyLink = async () => {
    if (!meetingLink) return;
    try {
      await navigator.clipboard.writeText(meetingLink);
      toast.success('Meeting link copied.');
    } catch {
      toast.error('Could not copy the link.');
    }
  };

  const start = booked?.startTime || booked?.startTimeIso || booked?.startAt || selectedSlot?.start;
  const effectiveDuration = booked?.durationMinutes || durationMinutes;
  const end = start ? new Date(new Date(start).getTime() + effectiveDuration * 60000).toISOString() : null;

  return (
    <Modal
      open={open}
      onClose={close}
      title={booked ? 'Meeting booked' : 'Book a meeting'}
      description={!booked ? personName(safeLead) : undefined}
      size="xl"
      dismissible={!saving}
      footer={
        booked ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving} disabled={!selectedSlot || noCalendar}>
              Confirm booking
            </Button>
          </>
        )
      }
    >
      {booked ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-emerald-900">{title}</p>
              <p className="text-sm text-emerald-700">
                {dateTime(start)} · {effectiveDuration} min
              </p>
              <p className="mt-1 text-xs font-medium text-emerald-700">{humanize(booked.status || 'PENDING')}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Lead</p>
            <p className="font-medium text-slate-800">{personName(safeLead)}</p>
            <p className="text-slate-500">
              {[safeLead.company, safeLead.email, safeLead.phone].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>

          {meetingLink && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
              <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                <Video size={16} className="shrink-0 text-brand-600" aria-hidden="true" />
                <span className="truncate">{meetingLink}</span>
              </div>
              <Button size="sm" variant="secondary" iconLeft={Copy} onClick={copyLink}>
                Copy link
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {meetingLink && (
              <Button
                as="a"
                href={meetingLink}
                target="_blank"
                rel="noreferrer"
                size="sm"
                variant="outline"
                iconLeft={ExternalLink}
              >
                Open meeting link
              </Button>
            )}
            {start && end && (
              <Button
                as="a"
                href={googleCalendarAddUrl({ title, description, location: meetingLink, startIso: start, endIso: end })}
                target="_blank"
                rel="noreferrer"
                size="sm"
                variant="outline"
                iconLeft={Calendar}
              >
                Add to Google Calendar
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <User size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate font-medium">{personName(safeLead)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Building2 size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate">{safeLead.company || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Mail size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate">{safeLead.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate">{safeLead.phone || '—'}</span>
            </div>
          </div>

          {callSummary && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                <Sparkles size={13} aria-hidden="true" /> AI call summary (context only)
              </p>
              <p className="text-sm text-slate-700">{callSummary}</p>
            </div>
          )}

          {noCalendar && (
            <ErrorState
              title="No calendar connected"
              error={{ message: 'Connect Google Calendar in Integrations before booking a meeting.' }}
            />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Meeting type"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              options={MEETING_TYPES.map((t) => ({ value: t, label: t }))}
            />
            <Select
              label="Duration"
              value={String(durationMinutes)}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              options={DURATIONS.map((d) => ({ value: String(d), label: `${d} min` }))}
            />
          </div>

          {meetingType === 'Custom' && (
            <Input
              label="Meeting title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Contract walkthrough"
            />
          )}

          {connectionRows.length > 1 && (
            <Select
              label="Calendar"
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
              options={connectionRows.map((c) => ({ value: c.id, label: humanize(c.provider) }))}
            />
          )}
          {connectionRows.length === 1 && (
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              Scheduling via <Badge tone="info" size="sm">{humanize(connectionRows[0].provider)}</Badge>
            </p>
          )}

          <p className="text-xs text-slate-500">
            Times shown in your timezone — <span className="font-medium text-slate-700">{BROWSER_TZ}</span>
          </p>

          <SlotPicker
            durationMinutes={durationMinutes}
            connectionId={connectionId || undefined}
            timezone={BROWSER_TZ}
            selected={selectedSlot?.start}
            onSelect={setSelectedSlot}
            reloadKey={reloadKey}
            maxHorizonDays={rule.data?.maxHorizonDays}
            enabled={!noCalendar}
          />

          <Textarea
            label="Notes"
            optional
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Anything the host should know before this meeting"
          />

          {selectedSlot && (
            <p className={cn('rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700')}>
              Selected: {dateTime(selectedSlot.start)}
            </p>
          )}

          {error && <ErrorState error={{ message: error }} compact />}
        </div>
      )}
    </Modal>
  );
}
