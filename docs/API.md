# Fixora REST API

Base URL: `http://localhost:5000/api` (development). All request and response bodies are JSON.

The same API serves the React web client today and is designed to serve a future mobile app unchanged: every business rule (verification visibility, double-booking prevention, cancellation policy, review eligibility, role checks) is enforced here, not in the client.

## Conventions

### Authentication

Sign in with the Firebase client SDK, then send the Firebase ID token on every protected request:

```
Authorization: Bearer <Firebase ID token>
```

The server verifies the token with the Firebase Admin SDK and loads the user's **role from Firestore** (`users/{uid}.role`). A role supplied by the client is never trusted. Suspended or deleted accounts receive `403 ACCOUNT_SUSPENDED`.

Access levels used below: **Public** (no token), **Optional** (token used if present), **Auth** (any signed-in user), **Customer**, **Provider**, **Admin**.

### Response envelope

```json
// success
{ "success": true, "message": "Booking created successfully", "data": { }, "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 } }

// error
{ "success": false, "message": "This time slot has just been booked. Please choose another time.", "errorCode": "BOOKING_CONFLICT", "details": [ ] }
```

`meta` is present on paginated lists (`?page=&limit=`, limit ≤ 100). `details` lists field-level validation errors as `{ field, message }` (e.g. `body.price`).

### Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request failed schema validation |
| `UNAUTHENTICATED` / `INVALID_TOKEN` | 401 | Missing, invalid or expired ID token |
| `FORBIDDEN` | 403 | Role not allowed for this endpoint |
| `PROFILE_NOT_FOUND` | 403 | Firebase account has no Fixora profile yet (call `/auth/register`) |
| `ACCOUNT_SUSPENDED` | 403 | Account suspended or deleted |
| `NOT_FOUND` | 404 | Resource missing **or not visible to you** (used instead of 403 for private records) |
| `ALREADY_EXISTS` | 409 | Duplicate record |
| `BOOKING_CONFLICT` | 409 | Slot overlaps another active booking (double-booking prevention) |
| `SLOT_UNAVAILABLE` | 409/400 | Outside working hours, day off, past date, insufficient notice |
| `PROVIDER_NOT_VERIFIED` | 400 | Provider is not verified/active |
| `SELF_BOOKING_NOT_ALLOWED` | 400 | Provider tried to book their own service |
| `INVALID_STATUS_TRANSITION` | 400 | Booking status change not allowed |
| `CANCELLATION_NOT_ALLOWED` | 409 | Cancellation blocked by policy or booking state |
| `LATE_CANCELLATION_CONFIRMATION_REQUIRED` | 409 | Late cancellation — resend with `acknowledgeLateCancellation: true` |
| `REVIEW_NOT_ALLOWED` | 400 | Booking not completed |
| `DUPLICATE_REVIEW` | 409 | Booking already reviewed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected error (details are never exposed) |

### Formats

* Dates: `YYYY-MM-DD`; times: `HH:mm` (24-hour). Booking dates/times are **UK local time (GMT/BST)**.
* Timestamps (`createdAt`, `updatedAt`): ISO-8601 UTC strings.
* Phone: UK format `07911123456` or `+447911123456`. Postcode: UK format, e.g. `SW1A 1AA`.
* Prices: GBP, numbers.

---

## Meta

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/health` | Public | Liveness check |
| GET | `/config` | Public | Support contacts, cancellation policy, max advance days, payment mode |

## Auth — `/api/auth`

Passwords never reach this API; Firebase Authentication handles sign-up, sign-in, email verification and password reset.

| Method | Path | Access | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | Firebase token (no profile yet) | `{ role: "customer"\|"provider", displayName, phone?, city? }` | Creates `users/{uid}` + `customers/{uid}` or `providers/{uid}` (status `pending`) + default availability. `admin` is rejected. Returns the session. |
| POST | `/auth/verify` | Auth | – | Validates the token and returns `{ user, provider }` (role included). Used after every login. |

## Users — `/api/users`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/users/me` | Auth | Own profile |
| PUT | `/users/me` | Auth | Update `displayName, phone, city, address, defaultAreaId, photoURL` (unknown fields such as `role` are rejected) |
| DELETE | `/users/me` | Auth (not admin) | Body `{ "confirm": "DELETE" }`. Cancels future bookings (notifying the other party), anonymises profile and booking/review personal data, deactivates provider listing and services, deletes the Firebase Auth user. Booking records are kept for integrity. |

## Customers — `/api/customers` (Customer)

| Method | Path | Description |
|---|---|---|
| GET | `/customers/dashboard` | Counts (upcoming, active, completed, cancelled, awaitingReview), upcoming & recent bookings, saved & recommended providers, recent reviews, recent activity |
| GET | `/customers/saved-providers` | Saved providers (public profiles) |
| GET | `/customers/saved-providers/ids` | Saved provider IDs |
| POST | `/customers/saved-providers/:id` | Save a provider |
| DELETE | `/customers/saved-providers/:id` | Remove from saved |

## Providers — `/api/providers`

### Public

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/providers` | Public | **Search.** Query: `categoryId`, `areaId` **or** `postalCode`, `minRating`, `maxPrice`, `availableOn` (date), `q`, `sort` (`rating`\|`reviews`\|`price_asc`\|`price_desc`), `page`, `limit`. Returns only verified, active providers with at least one active service in an active category. `data = { items: [{ provider, startingPrice, pricingType, primaryService, services, categoryNames, serviceCount }], context: { area?, areasForPostalCode? } }` |
| GET | `/providers/featured` | Public | Top-rated verified providers |
| GET | `/providers/recent-reviews` | Public | Recent positive published reviews (home page) |
| GET | `/providers/:id` | Optional | Public profile: `{ provider, services, categories, reviews, availability }`. Unverified providers return 404 except to the owner/admins. Phone shown only if the provider opted in. |
| GET | `/providers/:id/reviews` | Public | Paginated published reviews + `summary { ratingAverage, ratingCount, distribution }` |
| GET | `/providers/:id/availability` | Public | Weekly hours + upcoming unavailable dates |
| GET | `/providers/:id/slots?date=YYYY-MM-DD&serviceId=` | Public | Bookable start times for the date, sized to the service duration, excluding existing active bookings, days off and past times |

### Signed-in provider (Provider)

| Method | Path | Description |
|---|---|---|
| GET | `/providers/profile` | Own full provider record (incl. verification status/documents) |
| PUT | `/providers/profile` | Update `displayName, businessName, bio, phone, whatsapp, showPhonePublicly, experienceYears, photoURL, categoryIds[], areaIds[], verificationDocuments[]`. `areaIds` are validated and expanded into `postalCodes`, `cities`, `serviceAreas`. Re-submitting documents after rejection returns the account to `pending`. |
| GET | `/providers/dashboard` | Counts, earnings, rating, upcoming bookings, 6-month bookings/earnings, service popularity, verification status |
| GET | `/providers/earnings` | Earnings summary, 12-month series, paginated completed jobs |
| GET | `/providers/my-reviews` | Paginated own reviews |
| GET | `/providers/services` | Own services |
| GET | `/providers/services/:id` | One own service |
| POST | `/providers/services` | Create `{ categoryId, title, description?, price, pricingType: fixed\|starting_from\|hourly, duration (15–720 min), active?, imageURL? }` |
| PUT | `/providers/services/:id` | Update any of the above |
| DELETE | `/providers/services/:id` | Delete; services with bookings are archived (deactivated) instead |
| GET | `/providers/availability` | Own availability document |
| PUT | `/providers/availability` | `{ weekly: { monday: { enabled, start, end }, … sunday }, exceptions: [{ date, reason? }], slotIntervalMinutes?: 15\|30\|60, bufferMinutes?: 0–120 }` |

## Services — `/api/services`

Resource-style aliases (handy for mobile clients).

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/services/:id` | Public | Active service of a visible provider |
| GET | `/services/mine` | Provider | Same as `GET /providers/services` |
| POST | `/services` | Provider | Same as `POST /providers/services` |
| PUT | `/services/:id` | Provider | Same as `PUT /providers/services/:id` |
| DELETE | `/services/:id` | Provider | Same as `DELETE /providers/services/:id` |

## Availability — `/api/availability`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/availability/me` | Provider | Own availability |
| PUT | `/availability/me` | Provider | Update (same body as `PUT /providers/availability`) |
| GET | `/availability/:providerId` | Public | Public weekly schedule |
| GET | `/availability/:providerId/slots?date=&serviceId=` | Public | Bookable slots |

## Categories — `/api/categories`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/categories` | Optional | Active categories. Admins may pass `?includeInactive=true`. |
| GET | `/categories/:id` | Public | One category |
| POST | `/categories` | Admin | `{ name, description?, icon?, active? }` (name must be unique) |
| PUT | `/categories/:id` | Admin | Update / activate / deactivate |
| DELETE | `/categories/:id` | Admin | Refused (409) while services use the category — deactivate instead |

## Areas — `/api/areas` (public) and `/api/admin/areas` (admin)

Database-driven location search. No maps or geocoding APIs.

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/areas/search` (alias `/areas`) | Optional | Query `q` (matches area, city, district or postal code), `postalCode` (prefix), `city`, `province`, `page`, `limit`. Active areas only (admins: `includeInactive=true`). |
| GET | `/areas/facets` | Public | Distinct cities and provinces |
| GET | `/areas/:id` | Public | One area |
| GET | `/admin/areas` | Admin | All areas incl. inactive, same filters |
| POST | `/admin/areas` | Admin | `{ areaName, city, district, province, postalCode, active? }` — province must be a UK constituent country (England, Scotland, Wales or Northern Ireland) |
| PUT | `/admin/areas/:id` | Admin | Update; providers serving the area are re-synced |
| DELETE | `/admin/areas/:id` | Admin | Refused (409) while providers serve it — deactivate instead |

## Bookings — `/api/bookings` (Auth required — BR-7)

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/bookings` | Customer | `{ providerId, serviceId, bookingDate, startTime, customerAddress, areaId?, customerNotes?, customerPhone? }`. Validates provider (verified), service (owned, active, active category), date window, working hours, notice period and **overlaps inside a Firestore transaction**. `endTime` is derived from the service duration. Creates status `pending`, payment `cash`; notifies both parties. Errors: `BOOKING_CONFLICT`, `SLOT_UNAVAILABLE`, `PROVIDER_NOT_VERIFIED`, `SELF_BOOKING_NOT_ALLOWED`. |
| GET | `/bookings/my` | Customer, Provider | Own bookings. Query `status`, `scope` (`upcoming`\|`past`\|`all`), `page`, `limit`. |
| GET | `/bookings/:id` | Participant or Admin | Booking details (BR-10). Others get 404. |
| PATCH | `/bookings/:id/status` | Provider (own) or Admin | `{ status, providerNotes?, paymentStatus? }`. Provider transitions: `pending→confirmed\|rejected`, `confirmed→in_progress\|completed\|cancelled`, `in_progress→completed`. Completion is not allowed before the booking date. Admins may set any status. |
| PATCH | `/bookings/:id/payment` | Provider (own) or Admin | `{ paymentStatus: unpaid\|paid\|refunded\|cash }` |
| GET | `/bookings/:id/cancellation-preview` | Customer (owner) | `{ canCancel, isLate, cutoffMinutes, policy, fee, minutesUntilStart, message }` from current admin settings |
| PATCH | `/bookings/:id/cancel` | Customer (owner — BR-9) | `{ reason?, acknowledgeLateCancellation? }`. Free before `bookingCancellationCutoffMinutes`; afterwards per `lateCancellationPolicy` (`warn`, `fee`, `block`). |
| GET | `/bookings/:id/messages` | Customer/provider on the booking, or Admin | Returns the thread; viewing marks the other participant's messages read |
| POST | `/bookings/:id/messages` | Customer or provider on the booking | `{ text }` — the other participant is notified |

## Reviews — `/api/reviews` (Customer)

| Method | Path | Description |
|---|---|---|
| POST | `/reviews` | `{ bookingId, rating: 1–5, comment? }`. Only for the customer's own **completed** booking (BR-2); one review per booking (review ID = booking ID). Provider rating totals/average are updated in the same transaction. |
| GET | `/reviews/my` | `{ reviews, awaitingReview }` |
| PUT | `/reviews/:id` | Edit own published review (`rating?`, `comment?`); average adjusted |

Public provider reviews: `GET /providers/:id/reviews`.

## Complaints — `/api/complaints` (Customer, Provider)

| Method | Path | Description |
|---|---|---|
| POST | `/complaints` | `{ type: booking\|provider\|payment\|platform, bookingId?, providerId?, subject, description }`. `bookingId` required for `booking`; must be a booking you took part in. |
| GET | `/complaints/my` | Own complaints (paginated) |
| GET | `/complaints/:id` | One own complaint |

## Notifications — `/api/notifications` (Auth)

| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | `{ items, unreadCount }` (latest 100) |
| PATCH | `/notifications/:id/read` | Mark one as read |
| PATCH | `/notifications/read-all` | Mark all as read |

Notification types: `booking_created`, `booking_confirmed`, `booking_rejected`, `booking_cancelled`, `booking_completed`, `booking_updated`, `new_review`, `provider_verified`, `provider_status_changed`, `complaint_update`.

## Chatbot — `/api/chatbot`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/chatbot/message` | Optional | `{ message, history?: [{ role, content }] }` — **no userId field** (rejected). Returns `{ queryId, reply, links, resolved, source: account\|faq\|ai\|fallback, quickReplies }`. Account answers (booking status, earnings, admin counts) are computed only for the token's user. Every exchange is logged in `chatbotQueries`. |
| GET | `/chatbot/quick-replies` | Optional | Suggested questions for the caller's role |
| GET | `/chatbot/history` | Auth | Caller's own past questions and answers |

## Admin — `/api/admin` (Admin)

| Method | Path | Description |
|---|---|---|
| GET | `/admin/dashboard` | Totals (users, customers, providers, verified, pending, bookings, completed, cancelled, reviews, complaints, unanswered queries), recent bookings, verification queue |
| GET | `/admin/users` | Query `role`, `status`, `q`, paging |
| GET | `/admin/users/:id` | User + provider record + recent bookings |
| PATCH | `/admin/users/:id/status` | `{ status: active\|suspended, reason? }` — also disables/enables Firebase Auth and hides suspended providers. Admins cannot change their own status. |
| GET | `/admin/providers` | Query `status` (verification), `q`, paging |
| GET | `/admin/providers/:id` | Provider dossier: profile, user, services, availability, booking stats |
| PATCH | `/admin/providers/:id/verification` | `{ status: verified\|rejected\|suspended\|pending, note? }` (BR-8). Provider is notified. |
| GET/POST/PUT/DELETE | `/admin/areas…` | See Areas |
| GET | `/admin/bookings` | Query `status`, `scope`, `providerId`, `customerId`, `from`, `to`, paging |
| PATCH | `/admin/bookings/:id/status` | Support override of booking status (both parties notified) |
| GET | `/admin/reviews` | Query `status` (`published`\|`removed`) |
| PATCH | `/admin/reviews/:id` | `{ status: published\|removed, moderationNote? }` — rating average recalculated |
| GET | `/admin/complaints` | Query `status` |
| PATCH | `/admin/complaints/:id` | `{ status: open\|in_review\|resolved\|rejected, adminResponse? }` — user notified |
| GET | `/admin/chatbot-queries` | Query `resolved=true\|false` |
| PATCH | `/admin/chatbot-queries/:id` | `{ resolved, adminNote? }` |
| GET | `/admin/settings` | Platform settings |
| PUT | `/admin/settings` | `bookingCancellationCutoffMinutes, lateCancellationPolicy (warn\|fee\|block), lateCancellationFeePercent, slotIntervalMinutes, maxAdvanceBookingDays, supportEmail, supportPhone, platformName` |

## Reports — `/api/reports` and `/api/admin/reports` (Admin)

All accept `?months=1..24` (default 6).

| Method | Path | Description |
|---|---|---|
| GET | `/reports/summary` (also `/reports`) | Everything below in one response |
| GET | `/reports/bookings` | Totals, completion rate, revenue, per-month totals/completed/cancelled/rejected/revenue, counts by status |
| GET | `/reports/providers` | Top providers, per-provider performance (bookings, completion rate, cancellations, earnings, rating), platform average rating |
| GET | `/reports/categories` | Bookings, completions and revenue per category |
| GET | `/reports/users` | New customers/providers per month |

## Rate limits

* All `/api` routes: `RATE_LIMIT_MAX` per `RATE_LIMIT_WINDOW_MS` per IP (default 300 / 15 min)
* `/api/auth/*`: 30 / 15 min
* `POST /api/bookings`: 15 / min
* `POST /api/chatbot/message`: 20 / min
