import { Badge } from '../../components/ui';

/** Per-domain status -> tone, matching the backend's status vocabularies. `call` mirrors LiveCalls.jsx. */
const DOMAINS = {
  organization: { active: 'success', suspended: 'danger' },
  subscription: {
    TRIALING: 'info', ACTIVE: 'success', PAST_DUE: 'warning', CANCELLED: 'neutral', EXPIRED: 'danger',
  },
  payment: { PENDING: 'warning', SUCCEEDED: 'success', FAILED: 'danger', REFUNDED: 'info' },
  user: { active: 'success', suspended: 'danger' },
  call: {
    QUEUED: 'neutral', INITIATING: 'neutral', RINGING: 'info', CONNECTED: 'success', IN_PROGRESS: 'success',
    COMPLETED: 'success', FAILED: 'danger', NO_ANSWER: 'warning', BUSY: 'warning', VOICEMAIL: 'info',
    CALLBACK_SCHEDULED: 'info', DO_NOT_CALL: 'danger', CANCELLED: 'neutral',
  },
  audit: { platform: 'brand', tenant: 'neutral' },
};

export function StatusBadge({ status, domain = 'organization', size = 'md' }) {
  if (!status) return <span className="text-slate-400">—</span>;
  const tone = DOMAINS[domain]?.[status] || 'neutral';
  const text = String(status).replace(/_/g, ' ');
  return (
    <Badge tone={tone} size={size} dot>
      {text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}
    </Badge>
  );
}

export default StatusBadge;
