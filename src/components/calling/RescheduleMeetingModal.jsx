/**
 * Reschedule an existing meeting via `calendar.meetings.reschedule`. Reuses
 * the same `SlotPicker` as booking a new meeting; duration and calendar stay
 * whatever the meeting already has — only a new time (and an optional reason)
 * are collected.
 */
import React, { useEffect, useState } from 'react';
import { api, ApiError } from '../../api';
import { Modal, Button, Textarea, ErrorState, useToast } from '../ui';
import { dateTime } from '../../lib/format';
import SlotPicker from './SlotPicker';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function RescheduleMeetingModal({ open, onClose, meeting, onRescheduled }) {
  const toast = useToast();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    setSelectedSlot(null);
    setReason('');
    setSaving(false);
    setError('');
    setReloadKey(0);
  }, [open]);

  const durationMinutes = meeting?.durationMinutes || 30;

  const close = () => {
    if (saving) return;
    onClose();
  };

  const submit = async () => {
    if (saving || !selectedSlot || !meeting) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api.calendar.meetings.reschedule(meeting.id, {
        startTimeIso: selectedSlot.start,
        durationMinutes,
        timezone: BROWSER_TZ,
        reason: reason.trim() || undefined,
      });
      toast.success('Meeting rescheduled.');
      onRescheduled?.(updated);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setError('That time was just taken — pick another slot.');
        setSelectedSlot(null);
        setReloadKey((k) => k + 1);
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not reschedule this meeting.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Reschedule meeting"
      description={meeting?.title || 'Pick a new time'}
      size="lg"
      dismissible={!saving}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!selectedSlot}>
            Save new time
          </Button>
        </>
      }
    >
      {meeting && (
        <div className="space-y-4">
          <SlotPicker
            durationMinutes={durationMinutes}
            connectionId={meeting.connectionId}
            timezone={BROWSER_TZ}
            selected={selectedSlot?.start}
            onSelect={setSelectedSlot}
            reloadKey={reloadKey}
          />

          <Textarea
            label="Reason"
            optional
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why this meeting is moving (kept in the activity log)"
          />

          {selectedSlot && (
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
              New time: {dateTime(selectedSlot.start)}
            </p>
          )}

          {error && <ErrorState error={{ message: error }} compact />}
        </div>
      )}
    </Modal>
  );
}
