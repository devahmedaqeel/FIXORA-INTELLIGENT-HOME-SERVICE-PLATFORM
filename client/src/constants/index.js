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

export const PAYMENT_METHOD_LABELS = Object.freeze({ cash: 'Cash', bank_transfer: 'Bank transfer', other: 'Other' });
export const PAYMENT_METHOD_OPTIONS = Object.freeze(Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label })));

export const PAYMENT_CONFIRMATION_LABELS = Object.freeze({
  pending: 'Pending',
  customer_confirmed: 'Customer confirmed',
  provider_confirmed: 'Provider confirmed',
  paid: 'Paid',
  disputed: 'Disputed',
  partially_paid: 'Partially paid',
  refunded: 'Refunded',
});

export const COMMISSION_STATUS_LABELS = Object.freeze({
  due: 'Due',
  partially_paid: 'Partially paid',
  under_review: 'Under review',
  paid: 'Paid',
  rejected: 'Rejected',
  overdue: 'Overdue',
  disputed: 'Disputed',
  waived: 'Waived',
});

export const COMMISSION_STATUS_TONES = Object.freeze({
  due: 'warning',
  partially_paid: 'warning',
  under_review: 'info',
  paid: 'success',
  rejected: 'danger',
  overdue: 'danger',
  disputed: 'danger',
  waived: 'neutral',
});

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

export const UK_CONSTITUENT_COUNTRIES = Object.freeze(['England', 'Scotland', 'Wales', 'Northern Ireland']);

export const UK_COUNTRY_OPTIONS = Object.freeze(UK_CONSTITUENT_COUNTRIES.map((p) => ({ value: p, label: p })));

export const ADDRESS_LABEL_OPTIONS = Object.freeze([
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' },
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

export const PROVIDER_LANGUAGES = Object.freeze(['English', 'Welsh', 'Polish', 'Urdu', 'Punjabi', 'Bengali', 'Gujarati', 'Romanian', 'Portuguese', 'Arabic']);

export const RESPONSE_TIME_OPTIONS = Object.freeze([
  { value: 'within_hour', label: 'Within 1 hour' },
  { value: 'within_few_hours', label: 'Within a few hours' },
  { value: 'within_day', label: 'Within a day' },
  { value: 'within_few_days', label: 'A few days' },
]);

export const RESPONSE_TIME_LABELS = Object.freeze(Object.fromEntries(RESPONSE_TIME_OPTIONS.map((o) => [o.value, o.label])));

export const SEARCH_SORTS = Object.freeze([
  { value: 'rating', label: 'Top rated' },
  { value: 'reviews', label: 'Most reviewed' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
]);
