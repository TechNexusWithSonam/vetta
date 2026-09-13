/**
 * Schedule a callback for a call via `voice.calls.scheduleCallback`. Sets the
 * call's status to `CALLBACK_SCHEDULED` server-side; the caller refreshes the
 * call list/detail after a successful save.
 */
import React, { useState } from 'react';
import { api, ApiError } from '../../api';
import { Modal, Input, Button, useToast } from '../ui';

export default function CallbackModal({ open, onClose, call, onScheduled }) {
  const [when, setWhen] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const close = () => {
    if (saving) return;
    setError('');
    onClose();
  };

  const submit = async () => {
    if (!when) {
      setError('Pick a date and time.');
      return;
    }
    const iso = new Date(when).toISOString();
    setSaving(true);
    setError('');
    try {
      await api.voice.calls.scheduleCallback(call.id, iso);
      toast.success('Callback scheduled.');
      setWhen('');
      onScheduled?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not schedule the callback.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Schedule callback"
      description={call ? `For ${call.toPhoneNumber || 'this lead'}` : undefined}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            Schedule
          </Button>
        </>
      }
    >
      <Input
        type="datetime-local"
        label="Callback time"
        value={when}
        onChange={(e) => setWhen(e.target.value)}
        error={error}
        required
      />
    </Modal>
  );
}
