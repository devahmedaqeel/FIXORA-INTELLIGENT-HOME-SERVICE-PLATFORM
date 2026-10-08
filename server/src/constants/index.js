/** Shared enums and constants. Business rules read from here — never from string literals. */

export const COLLECTIONS = Object.freeze({
  USERS: 'users',
  CUSTOMERS: 'customers',
  PROVIDERS: 'providers',
  SERVICES: 'services',
  CATEGORIES: 'categories',
  AREAS: 'areas',
  AVAILABILITY: 'availability',
  BOOKINGS: 'bookings',
  BOOKING_LOCKS: 'bookingLocks',
  REVIEWS: 'reviews',
  COMPLAINTS: 'complaints',
  NOTIFICATIONS: 'notifications',
  CHATBOT_QUERIES: 'chatbotQueries',
  SETTINGS: 'settings',
});

export const ROLES = Object.freeze({ CUSTOMER: 'customer', PROVIDER: 'provider', ADMIN: 'admin' });
export const SELF_REGISTER_ROLES = [ROLES.CUSTOMER, ROLES.PROVIDER];

export const ACCOUNT_STATUS = Object.freeze({ ACTIVE: 'active', SUSPENDED: 'suspended', DELETED: 'deleted' });

export const VERIFICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
});

export const PRICING_TYPES = Object.freeze(['fixed', 'starting_from', 'hourly']);

export const RESPONSE_TIME_VALUES = Object.freeze(['within_hour', 'within_few_hours', 'within_day', 'within_few_days']);

export const PROVIDER_LANGUAGES = Object.freeze(['English', 'Urdu', 'Punjabi', 'Pashto', 'Sindhi', 'Saraiki', 'Balochi']);

export const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
});

/** Statuses that occupy a provider's time slot. */
export const ACTIVE_BOOKING_STATUSES = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.IN_PROGRESS,
];

/** Allowed provider-driven transitions: from -> [to]. */
export const PROVIDER_BOOKING_TRANSITIONS = Object.freeze({
  pending: ['confirmed', 'rejected'],
  confirmed: ['in_progress', 'completed', 'cancelled'],
  in_progress: ['completed'],
});

export const PAYMENT_STATUS = Object.freeze({
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
  CASH: 'cash',
});

export const REVIEW_STATUS = Object.freeze({ PUBLISHED: 'published', REMOVED: 'removed' });

export const COMPLAINT_TYPES = Object.freeze(['booking', 'provider', 'payment', 'platform']);
export const COMPLAINT_STATUS = Object.freeze({
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
});

export const NOTIFICATION_TYPES = Object.freeze({
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_REJECTED: 'booking_rejected',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_UPDATED: 'booking_updated',
  NEW_REVIEW: 'new_review',
  PROVIDER_VERIFIED: 'provider_verified',
  PROVIDER_STATUS_CHANGED: 'provider_status_changed',
  COMPLAINT_UPDATE: 'complaint_update',
});

export const WEEKDAYS = Object.freeze([
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]);

/** Late-cancellation behaviour once inside the cutoff window. */
export const LATE_CANCELLATION_POLICIES = Object.freeze(['warn', 'fee', 'block']);

/** Defaults written to settings/platform when missing. Admin can change them at runtime. */
export const DEFAULT_SETTINGS = Object.freeze({
  bookingCancellationCutoffMinutes: 120,
  lateCancellationPolicy: 'warn',
  lateCancellationFeePercent: 0,
  slotIntervalMinutes: 30,
  maxAdvanceBookingDays: 60,
  supportEmail: 'support@fixora.pk',
  supportPhone: '+92 300 0000000',
  platformName: 'Fixora',
});

/** Pakistan Standard Time has no DST, so a fixed offset is exact. */
export const PLATFORM_UTC_OFFSET = '+05:00';
export const PLATFORM_UTC_OFFSET_MINUTES = 300;
export const DEFAULT_COUNTRY = 'Pakistan';

export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  FORBIDDEN: 'FORBIDDEN',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  SLOT_UNAVAILABLE: 'SLOT_UNAVAILABLE',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  CANCELLATION_NOT_ALLOWED: 'CANCELLATION_NOT_ALLOWED',
  LATE_CANCELLATION_CONFIRMATION_REQUIRED: 'LATE_CANCELLATION_CONFIRMATION_REQUIRED',
  SELF_BOOKING_NOT_ALLOWED: 'SELF_BOOKING_NOT_ALLOWED',
  PROVIDER_NOT_VERIFIED: 'PROVIDER_NOT_VERIFIED',
  REVIEW_NOT_ALLOWED: 'REVIEW_NOT_ALLOWED',
  DUPLICATE_REVIEW: 'DUPLICATE_REVIEW',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});
