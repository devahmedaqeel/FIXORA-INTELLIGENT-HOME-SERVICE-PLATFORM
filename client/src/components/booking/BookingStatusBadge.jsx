import Badge from '../common/Badge';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_TONES } from '../../constants';

export default function BookingStatusBadge({ status }) {
  return <Badge tone={BOOKING_STATUS_TONES[status] || 'neutral'}>{BOOKING_STATUS_LABELS[status] || status}</Badge>;
}
