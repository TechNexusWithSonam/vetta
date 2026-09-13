/**
 * Cancel an existing meeting via `calendar.meetings.cancel`. Always requires
 * an explicit confirm; an optional reason is passed straight through to the
 * API (kept in the meeting's activity log).
 */
import React, { useState } from 'react';
import { api, ApiError } from '../../api';
import { ConfirmDialog, Textarea, useToast } from '../ui';

export default function CancelMeetingDialog({ open, onClose, meeting, onCancelled }) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset the form when the dialog transitions closed->open, following
  // React's "adjust state during render" pattern instead of an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setReason('');
      setSaving(false);
    }
  }

  const confirm = async () => {
    if (!meeting) return;
    setSaving(true);
    try {
      const updated = await api.calendar.meetings.cancel(meeting.id, { reason: reason.trim() || undefined });
      toast.success('Meeting cancelled.');
      onCancelled?.(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? `Could not cancel: ${err.message}` : 'Could not cancel this meeting.');
      setSaving(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={confirm}
      title="Cancel this meeting?"
      confirmLabel="Cancel meeting"
      cancelLabel="Keep meeting"
      tone="danger"
      loading={saving}
      message={
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {meeting?.title || 'This meeting'} will be marked cancelled. This can&apos;t be undone from here.
          </p>
          <Textarea
            label="Reason"
            optional
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional — kept in the activity log"
          />
        </div>
      }
    />
  );
}
