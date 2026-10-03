/**
 * Do-Not-Call registry: lists `voice.doNotCall.list` and, for OWNER/ADMIN,
 * lets them add a number via `voice.doNotCall.add`. Adding here does not
 * retroactively refresh the pre-dial check elsewhere on the page (see
 * `useDncPhones`) — that check re-fetches on its own next mount.
 */
import React, { useState } from 'react';
import { api, ApiError } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Modal, Input, Button, SkeletonText, ErrorState, useToast } from '../ui';
import { humanize, relativeTime } from '../../lib/format';

export default function DoNotCallModal({ open, onClose, canManage }) {
  const list = useAsync(
    () => (open ? api.voice.doNotCall.list({ page: 1, limit: 50 }) : Promise.resolve(null)),
    [open],
  );
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const rows = list.data?.data ?? list.data ?? [];

  const add = async () => {
    if (!phone.trim()) {
      setError('Enter a phone number.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.voice.doNotCall.add({ phoneNumber: phone.trim(), reason: reason.trim() || undefined });
      toast.success('Number added to the Do-Not-Call list.');
      setPhone('');
      setReason('');
      list.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add this number.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Do Not Call list" size="lg">
      {canManage ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <Input
            placeholder="+1 555 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="min-w-[10rem] flex-1"
          />
          <Input
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-w-[10rem] flex-1"
          />
          <Button onClick={add} loading={saving}>
            Add
          </Button>
        </div>
      ) : (
        <p className="mb-4 text-xs text-slate-500">Only owners/admins can add numbers to this list.</p>
      )}
      {error && <p className="mb-2 text-xs text-rose-600">{error}</p>}

      {list.loading && <SkeletonText lines={4} />}
      {list.error && <ErrorState error={list.error} onRetry={list.reload} compact />}
      {!list.loading && !list.error && rows.length === 0 && (
        <p className="text-sm text-slate-400">No numbers on the list yet.</p>
      )}
      {!list.loading && !list.error && rows.length > 0 && (
        <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium text-slate-800">{r.phoneNumber}</span>
              <span className="text-xs text-slate-400">
                {r.reason || humanize(r.source || '')} · {relativeTime(r.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
