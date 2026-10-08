export const APP_NAME = 'Fixora';

export const ROLES = Object.freeze({ CUSTOMER: 'customer', PROVIDER: 'provider', ADMIN: 'admin' });

export const DASHBOARD_PATHS = Object.freeze({
  customer: '/customer/dashboard',
  provider: '/provider/dashboard',
  admin: '/admin/dashboard',
});

export const BOOKING_STATUS_LABELS = Object.freeze({
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Declined',
});

export const BOOKING_STATUS_TONES = Object.freeze({
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'accent',
  completed: 'success',
  cancelled: 'neutral',
  rejected: 'danger',
});

export const PAYMENT_STATUS_LABELS = Object.freeze({ unpaid: 'Unpaid', paid: 'Paid', refunded: 'Refunded', cash: 'Cash' });

export const PRICING_TYPES = Object.freeze([
  { value: 'fixed', label: 'Fixed price' },
  { value: 'starting_from', label: 'Starting from' },
  { value: 'hourly', label: 'Per hour' },
]);

export const VERIFICATION_LABELS = Object.freeze({
  pending: 'Pending verification',
  verified: 'Verified',
  rejected: 'Rejected',
  suspended: 'Suspended',
});

export const COMPLAINT_TYPES = Object.freeze([
  { value: 'booking', label: 'Booking' },
  { value: 'provider', label: 'Provider' },
  { value: 'payment', label: 'Payment' },
  { value: 'platform', label: 'Platform / website' },
]);

export const COMPLAINT_STATUS_LABELS = Object.freeze({ open: 'Open', in_review: 'In review', resolved: 'Resolved', rejected: 'Rejected' });

export const PAKISTAN_PROVINCES = Object.freeze([
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu and Kashmir',
  'Gilgit-Baltistan',
]);

export const WEEKDAYS = Object.freeze([
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]);

export const SEARCH_SORTS = Object.freeze([
  { value: 'rating', label: 'Top rated' },
  { value: 'reviews', label: 'Most reviewed' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
]);
