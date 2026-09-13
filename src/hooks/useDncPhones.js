/**
 * Best-effort Do-Not-Call lookup for the pre-dial check on Leads/Call-now.
 *
 * There is no `leadId`/`phoneNumber` -> DNC lookup endpoint (see
 * `src/api/resources/voice.js`), so this fetches the first page of
 * `GET /voice/do-not-call` and builds a phone-number `Set` from it. Orgs with
 * more entries than fit on one page won't be fully covered client-side — the
 * backend remains authoritative and still rejects a DNC number at
 * `voice.calls.create` regardless of what this check finds.
 */
import { useMemo } from 'react';
import { api } from '../api';
import { useAsync } from './useAsync';

export function useDncPhones() {
  const dnc = useAsync(() => api.voice.doNotCall.list({ page: 1, limit: 100 }), []);

  const phones = useMemo(() => {
    const rows = dnc.data?.data ?? dnc.data ?? [];
    return new Set(rows.map((r) => r.phoneNumber).filter(Boolean));
  }, [dnc.data]);

  return { phones, loading: dnc.loading, error: dnc.error, reload: dnc.reload };
}
