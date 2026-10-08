import Icon from '../common/Icon';
import Badge from '../common/Badge';
import { VERIFICATION_LABELS } from '../../constants';

const TONES = { verified: 'success', pending: 'warning', rejected: 'danger', suspended: 'danger' };

/** Green "Verified" chip for public profiles, or the full status for owners/admins. */
export default function ProviderVerificationBadge({ status, compact = false }) {
  if (status === 'verified') {
    return (
      <span className={`verified-badge ${compact ? 'verified-badge--compact' : ''}`} title="Identity and details verified by Fixora">
        <Icon name="shield" size={compact ? 14 : 16} />
        {!compact && <span>Verified</span>}
        {compact && <span className="sr-only">Verified provider</span>}
      </span>
    );
  }
  return <Badge tone={TONES[status] || 'neutral'}>{VERIFICATION_LABELS[status] || status}</Badge>;
}
