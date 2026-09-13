import { Badge } from '../../components/ui';

/** Shown wherever the mock-fallback data layer served demo data instead of a real backend response. */
export function DemoDataBadge({ className = '' }) {
  return (
    <Badge tone="warning" dot className={className}>
      Demo data — backend pending
    </Badge>
  );
}

export default DemoDataBadge;
