/**
 * "Call now" from inside Live Calls: search leads (`leads.list`) and place a
 * call (`placeCall`, the same create+brief-fallback flow the Leads page
 * uses) without navigating away. Respects role gating and the best-effort
 * DNC pre-check.
 */
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api, ApiError } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { placeCall } from '../../lib/placeCall';
import { Modal, Input, Button, SkeletonText, useToast } from '../ui';
import { personName } from '../../lib/format';

export default function CallNowModal({ open, onClose, onCreated, canManage, dncPhones }) {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [dialingId, setDialingId] = useState(null);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 350);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    if (!open) {
      setTerm('');
      setDebounced('');
      setError('');
    }
  }, [open]);

  const results = useAsync(
    () => (open && debounced ? api.leads.list({ search: debounced, limit: 8 }) : Promise.resolve(null)),
    [open, debounced],
  );
  const rows = results.data?.data ?? [];

  const call = async (lead) => {
    if (!lead.phone) {
      setError('This lead has no phone number.');
      return;
    }
    if (dncPhones.has(lead.phone)) {
      setError('This number is on the Do-Not-Call list.');
      return;
    }
    if (!window.confirm(`Place a real call to ${personName(lead)} at ${lead.phone}?`)) return;
    setDialingId(lead.id);
    setError('');
    setStep('Starting call…');
    try {
      const created = await placeCall({ leadId: lead.id, onStep: setStep });
      toast.success('Call started.');
      onCreated(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the call.');
    } finally {
      setDialingId(null);
    }
  };

  if (!canManage) {
    return (
      <Modal open={open} onClose={onClose} title="Call now" size="sm">
        <p className="text-sm text-slate-500">Only owners/admins can place calls.</p>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Call now" size="lg">
      <Input
        icon={Search}
        placeholder="Search leads by name, company, or phone…"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        autoFocus
      />
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

      <div className="mt-3 max-h-80 divide-y divide-slate-100 overflow-y-auto">
        {results.loading && <SkeletonText lines={3} className="py-2" />}
        {!results.loading && debounced && rows.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">No leads match "{debounced}".</p>
        )}
        {!debounced && <p className="py-4 text-center text-sm text-slate-400">Type to search leads.</p>}
        {rows.map((lead) => {
          const onDnc = Boolean(lead.phone && dncPhones.has(lead.phone));
          return (
            <div key={lead.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{personName(lead)}</p>
                <p className="truncate text-xs text-slate-500">
                  {lead.company || '—'} · {lead.phone || 'No number'}
                </p>
              </div>
              <Button
                size="sm"
                variant={onDnc ? 'secondary' : 'primary'}
                onClick={() => call(lead)}
                disabled={!lead.phone || onDnc || dialingId === lead.id}
                loading={dialingId === lead.id}
              >
                {onDnc ? 'On DNC' : 'Call'}
              </Button>
            </div>
          );
        })}
      </div>

      {dialingId && step && <p className="mt-2 text-xs text-slate-500">{step}</p>}
    </Modal>
  );
}
