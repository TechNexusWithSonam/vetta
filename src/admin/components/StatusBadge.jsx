import { Badge } from '../../components/ui';

/** Per-domain status -> tone. `call` mirrors LiveCalls.jsx's exact status vocabulary. */
const DOMAINS = {
  organization: {
    active: 'success', trial: 'info', suspended: 'danger', churned: 'neutral',
  },
  subscription: {
    TRIAL: 'info', ACTIVE: 'success', PAST_DUE: 'warning', CANCELLED: 'neutral', EXPIRED: 'danger',
  },
  invoice: {
    paid: 'success', open: 'warning', failed: 'danger', refunded: 'info',
  },
  user: {
    active: 'success', invited: 'info', suspended: 'danger',
  },
  call: {
    QUEUED: 'neutral', INITIATING: 'neutral', RINGING: 'info', CONNECTED: 'success', IN_PROGRESS: 'success',
    COMPLETED: 'success', FAILED: 'danger', NO_ANSWER: 'warning', BUSY: 'warning', VOICEMAIL: 'info',
    CALLBACK_SCHEDULED: 'info', DO_NOT_CALL: 'danger', CANCELLED: 'neutral',
  },
};

export function StatusBadge({ status, domain = 'organization', size = 'md' }) {
  const tone = DOMAINS[domain]?.[status] || 'neutral';
  const label = String(status || '').replace(/_/g, ' ');
  return (
    <Badge tone={tone} size={size} dot>
      {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
    </Badge>
  );
}

export default StatusBadge;
