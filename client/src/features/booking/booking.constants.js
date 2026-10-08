/** Provider actions available for each booking status (mirrors server PROVIDER_BOOKING_TRANSITIONS). */
export const PROVIDER_ACTIONS = Object.freeze({
  pending: [
    { status: 'confirmed', label: 'Accept booking', variant: 'primary' },
    { status: 'rejected', label: 'Decline', variant: 'danger', confirm: 'Decline this booking request? The customer will be notified.' },
  ],
  confirmed: [
    { status: 'in_progress', label: 'Start job', variant: 'primary' },
    { status: 'completed', label: 'Mark completed', variant: 'secondary' },
    { status: 'cancelled', label: 'Cancel booking', variant: 'danger', confirm: 'Cancel this confirmed booking? The customer will be notified.' },
  ],
  in_progress: [{ status: 'completed', label: 'Mark completed', variant: 'primary' }],
});

export const BOOKING_FILTERS = Object.freeze([
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Declined' },
]);

export const ACTIVE_STATUSES = ['pending', 'confirmed', 'in_progress'];
