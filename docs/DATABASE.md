# Fixora Firestore database

Fixora uses **Cloud Firestore** as its only database (no MySQL, MongoDB or local JSON). The Express API reads and writes through the Firebase Admin SDK via repository classes in `server/src/repositories/`. Browser clients do not write to Firestore directly; `firebase/firestore.rules` enforces least-privilege access as defence in depth.

Conventions

* Document IDs: Firebase Auth UID for per-user documents (`users`, `customers`, `providers`, `availability`); auto IDs elsewhere, except `reviews` (ID = booking ID, which makes duplicate reviews impossible) and `settings/platform`.
* Timestamps are ISO-8601 UTC strings (`createdAt`, `updatedAt`, …).
* Booking dates/times are Pakistan local time: `bookingDate` `YYYY-MM-DD`, `startTime`/`endTime` `HH:mm`.
* Money is PKR as numbers.
* Some fields are **denormalised** (e.g. provider `postalCodes`, booking `serviceTitle`) so lists and search need a single query. The service layer keeps them in sync.

## Collections

### `users/{uid}`
| Field | Type | Notes |
|---|---|---|
| uid | string | Firebase Auth UID |
| email | string \| null | null after account deletion |
| displayName | string | |
| role | `customer` \| `provider` \| `admin` | Set server-side at registration; admins via `create-admin` script |
| status | `active` \| `suspended` \| `deleted` | Checked on every request |
| phone, city, address, photoURL, defaultAreaId | string | Profile fields |
| statusReason | string | Admin note when suspended |
| createdAt, updatedAt, lastLoginAt, deletedAt | string | |

### `customers/{uid}`
`userId`, `savedProviderIds: string[]`, `createdAt`, `updatedAt`.

### `providers/{uid}`
| Field | Type | Notes |
|---|---|---|
| userId, displayName, businessName, bio | string | |
| phone, whatsapp | string | |
| showPhonePublicly | boolean | Phone hidden from public profile unless true |
| photoURL | string | Firebase Storage URL |
| experienceYears | number | |
| categoryIds | string[] | Union of chosen categories and categories of active services |
| areaIds | string[] | Service areas (→ `areas`) |
| postalCodes, cities | string[] | Derived from `areaIds` — used by ZIP search |
| serviceAreas | `{ id, areaName, city, postalCode }[]` | Derived, for display |
| verificationStatus | `pending` \| `verified` \| `rejected` \| `suspended` | Starts `pending`; only `verified` is searchable (BR-1) |
| verificationNote, verifiedAt, verifiedBy, verificationUpdatedAt | | Admin audit |
| verificationDocuments | `{ name, url, path }[]` | Storage `verification/{uid}/…` |
| accountActive | boolean | false when the user account is suspended/deleted |
| ratingTotal, ratingCount, ratingAverage | number | Maintained transactionally with reviews |
| completedBookings | number | Maintained with booking status changes |
| minPrice, activeServiceCount | number | Derived from services |
| createdAt, updatedAt | string | |

### `services/{serviceId}`
`providerId`, `categoryId`, `categoryName`, `title`, `description`, `price`, `pricingType` (`fixed` \| `starting_from` \| `hourly`), `duration` (minutes, 15–720), `active`, `archived` (kept for history when a service with bookings is "deleted"), `imageURL`, `createdAt`, `updatedAt`.

### `categories/{categoryId}`
`name`, `slug` (unique), `description`, `icon`, `active`, `sortOrder`, `createdAt`, `updatedAt`. Only `active` categories are public (BR-4).

### `areas/{areaId}`
| Field | Example |
|---|---|
| areaName | New Mirpur City |
| city | Mirpur |
| district | Mirpur |
| province | Azad Jammu and Kashmir |
| postalCode | 10250 |
| country | Pakistan |
| active | true |
| createdAt, updatedAt | |

Seeded areas cover all provinces/territories. Many Pakistani neighbourhoods share one postal code (e.g. most Islamabad sectors use 44000). Verify codes with Pakistan Post before production; admins can edit them in **Admin → Areas**.

### `availability/{providerId}`
```json
{
  "providerId": "uid",
  "weekly": { "monday": { "enabled": true, "start": "09:00", "end": "17:00" }, "...": {}, "sunday": { "enabled": false, "start": "09:00", "end": "17:00" } },
  "exceptions": [{ "date": "2026-12-25", "reason": "Holiday" }],
  "slotIntervalMinutes": 30,
  "bufferMinutes": 0,
  "updatedAt": "..."
}
```

### `bookings/{bookingId}`
| Field | Notes |
|---|---|
| customerId, customerName, customerPhone | |
| providerId, providerName | |
| serviceId, serviceTitle, categoryId, categoryName | Snapshot at booking time |
| bookingDate, startTime, endTime, duration | PKT; `endTime` derived from service duration |
| price, pricingType | Price snapshot (earnings use this) |
| areaId, areaName, customerAddress | |
| customerNotes, providerNotes | |
| status | `pending` \| `confirmed` \| `in_progress` \| `completed` \| `cancelled` \| `rejected` |
| paymentStatus, paymentMethod, paymentReference | `unpaid` \| `paid` \| `refunded` \| `cash`; default `cash` |
| statusHistory | `{ status, at, by }[]` |
| cancelledBy, cancelledAt, cancellationReason, lateCancellation, cancellationFee | |
| completedAt, reviewed | |
| createdAt, updatedAt | |

### `bookingLocks/{providerId_YYYY-MM-DD}`
Server-only concurrency guard: `providerId`, `bookingDate`, `bookingCount`, `updatedAt`. Every booking transaction reads and writes this document, so two simultaneous requests for the same provider/day conflict and Firestore retries one of them — the retried transaction sees the first booking and is rejected with `BOOKING_CONFLICT`.

### `reviews/{bookingId}`
`bookingId`, `customerId`, `customerName`, `providerId`, `serviceId`, `serviceTitle`, `rating` (1–5), `comment`, `status` (`published` \| `removed`), `moderationNote`, `moderatedBy`, `moderatedAt`, `createdAt`, `updatedAt`.

### `complaints/{complaintId}`
`userId`, `userRole`, `userName`, `userEmail`, `type` (`booking` \| `provider` \| `payment` \| `platform`), `bookingId`, `bookingSummary`, `providerId`, `subject`, `description`, `status` (`open` \| `in_review` \| `resolved` \| `rejected`), `adminResponse`, `handledBy`, `closedAt`, `createdAt`, `updatedAt`.

### `notifications/{notificationId}`
`userId`, `type`, `title`, `message`, `link` (client route), `data`, `read`, `readAt`, `createdAt`.

### `chatbotQueries/{queryId}`
`userId` (null for guests), `userRole`, `question`, `response`, `resolved`, `source` (`account` \| `faq` \| `ai` \| `fallback`), `intent`, `adminNote`, `reviewedBy`, `reviewedAt`, `createdAt`.

### `settings/platform`
| Field | Default | Meaning |
|---|---|---|
| bookingCancellationCutoffMinutes | 120 | Free cancellation until this many minutes before start |
| lateCancellationPolicy | `warn` | `warn` (allow after confirmation), `fee`, or `block` |
| lateCancellationFeePercent | 0 | Used when policy is `fee` |
| slotIntervalMinutes | 30 | Default slot step |
| maxAdvanceBookingDays | 60 | Booking window |
| supportEmail, supportPhone, platformName | | Shown on Contact page and in chatbot fallback |

## Indexes

Composite indexes are defined in `firebase/firestore.indexes.json` and deployed with `firebase deploy --only firestore:indexes`. They cover:

* providers: `verificationStatus` + `areaIds`/`postalCodes`/`categoryIds` (array-contains), + `createdAt`, + `ratingAverage`
* services: `providerId` + `active`, `categoryId` + `active`
* areas: `postalCode` + `active`, `province` + `city`
* bookings: `customerId`/`providerId` + `bookingDate`, `providerId` + `bookingDate` + `status`, `customerId`/`providerId` + `status`, `status` + `bookingDate`/`createdAt`
* reviews: `providerId` + `status` + `createdAt`, `customerId` + `createdAt`, `status` + `createdAt`
* complaints, notifications, chatbotQueries: owner/status + `createdAt`

If Firestore reports a missing index at runtime, the error message contains a console link that creates it.

## Storage layout (Firebase Storage)

| Path | Who can write | Who can read |
|---|---|---|
| `providers/{uid}/profile/*` | owner (images ≤ 2 MB) | public |
| `users/{uid}/avatar/*` | owner (images ≤ 2 MB) | public |
| `services/{uid}/*` | owner (images ≤ 3 MB) | public |
| `verification/{uid}/*` | owner (PDF/images ≤ 5 MB) | owner + admins |

Only download URLs and paths are stored in Firestore — never binary data.
