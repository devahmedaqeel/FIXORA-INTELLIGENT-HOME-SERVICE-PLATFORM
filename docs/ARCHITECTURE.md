# Fixora architecture

```
┌──────────────────────────┐        ┌───────────────────────────┐
│ React web client (Vite)  │        │ Future mobile app          │
│ presentation layer       │        │ (same REST API)            │
└─────────────┬────────────┘        └──────────────┬────────────┘
              │  HTTPS + JSON, Authorization: Bearer <Firebase ID token>
              ▼                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Express REST API  (/api)                                         │
│ routes → middleware (auth, role, validation, rate limit)         │
│        → controllers (thin) → services (business rules)          │
│        → repositories (data access)                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │ Firebase Admin SDK
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Firebase: Authentication · Cloud Firestore · Storage             │
└─────────────────────────────────────────────────────────────────┘
```

The browser talks to Firebase directly for exactly two things: **Authentication** (sign-up, sign-in, password reset, email verification) and **Storage uploads** (profile photos, verification documents — governed by `storage.rules`). All application data flows through the API, which is why the same backend can serve a mobile app later without duplicating rules.

## Backend layers (`server/src`)

| Layer | Folder | Responsibility |
|---|---|---|
| Config | `config/` | `environment.js` (typed env), `firebase.js` (single Admin SDK init; test override hook) |
| Routes | `routes/`, `reports/reports.routes.js`, `chatbot/chatbot.routes.js` | URL → middleware → controller wiring |
| Middleware | `middleware/` | `authenticateUser`, `optionalAuth`, `verifyFirebaseToken`, `requireCustomer/Provider/Admin`, `validate` (zod), rate limiters, central error handler |
| Validators | `validators/` | zod schemas for every body/query/params; `.strict()` rejects unknown fields such as `role` or `userId` |
| Controllers | `controllers/` | Translate HTTP ↔ service calls; no business logic |
| Services | `services/` | Business rules: booking engine, cancellation policy, reviews/ratings, verification, notifications, payments, settings |
| Repositories | `repositories/` | One class per Firestore collection; all queries live here |
| Utils | `utils/` | `ApiError`, response helpers, time (PKT), pure scheduling rules, serializers |
| Chatbot | `chatbot/` | Intent detection, FAQ knowledge base, role-scoped context, pluggable AI provider |
| Reports | `reports/` | Aggregations for admin reports |

### Request lifecycle

1. `helmet`, CORS allow-list (`CLIENT_URL`), JSON body limit, rate limit.
2. `authenticateUser` verifies the ID token with `admin.auth().verifyIdToken` (revocation checked in production), loads `users/{uid}` and rejects missing/suspended profiles. **The role comes from Firestore only.**
3. `requireRole(...)` gates the route.
4. `validate({ body, query, params })` parses input with zod; failures → `400 VALIDATION_ERROR` with field details.
5. Controller calls a service; the service enforces business rules and uses repositories.
6. Errors are `ApiError`s with stable `errorCode`s; the central handler hides internals from clients.

### Booking engine & double-booking prevention

`services/booking.service.js#createBooking`:

1. Provider must be verified and active (BR-1); customer ≠ provider (BR-3).
2. Service must belong to the provider, be active, and sit in an active category (BR-4).
3. Date must be today or later and inside `maxAdvanceBookingDays`.
4. Inside `db.runTransaction`:
   * read `bookingLocks/{providerId_date}`,
   * read every booking for that provider and date,
   * run the **same pure rule** used to list slots (`utils/scheduling.js#evaluateSlot`): working hours, exception dates, minimum notice, and half-open interval overlap with active bookings (`pending`, `confirmed`, `in_progress`) plus optional buffer,
   * write the booking and bump the lock document.

   Because every booking for a provider/day writes the same lock document, concurrent transactions conflict and Firestore retries the loser, which then sees the first booking and fails with `BOOKING_CONFLICT`. The frontend calendar only offers server-generated free slots, but correctness never depends on the client.

### Cancellation policy (BR-6)

`services/booking.policy.js#evaluateCancellation` is the single implementation. It reads `bookingCancellationCutoffMinutes`, `lateCancellationPolicy` and `lateCancellationFeePercent` from `settings/platform` (cached 30 s, editable in Admin → Settings). The preview endpoint and the cancel endpoint share it, so the warning a customer sees is exactly what the server enforces.

### Ratings

Reviews use the booking ID as document ID (no duplicates). Creating, editing or moderating a review adjusts `ratingTotal`/`ratingCount` and recomputes `ratingAverage` in the same transaction.

### Notifications

`services/notification/notification.service.js#notify` stores an in-app notification and fans out to channels (`channels/email.channel.js`: none/console/SMTP/Resend; `channels/sms.channel.js`: none/console). Delivery failures are logged and never fail the booking/review operation. New providers (e.g. an SMS gateway) are added as adapters without touching business code.

### Payments

`services/payment/payment.service.js` selects a provider (`cash` default, `stripe` optional via REST). If a gateway is missing or fails, bookings fall back to cash so the platform keeps working.

### Chatbot

`chatbot/chatbot.service.js` answers in order: account-data intents → FAQ → AI provider → fallback.

* **Privacy:** account intents (`chatbot.context.js`) receive the authenticated `req.user` only; the request schema has no user ID field and `.strict()` rejects one. Customers can only query their own bookings, providers their own bookings/earnings, admins platform counts. The AI provider receives a context summary containing only the caller's own data.
* **Provider abstraction:** `chatbot/providers/aiProvider.js` supports `openai`, `anthropic`, `gemini` (or `none`) via `AI_PROVIDER` / `AI_API_KEY` / `AI_MODEL`. Without a key, FAQ answers still work.
* **Fallback:** apologises, suggests the closest help article, offers human support (from settings), and logs the query with `resolved: false` for admins.

## Frontend (`client/src`)

| Folder | Contents |
|---|---|
| `features/` | Domain modules: `auth` (context, Firebase auth service, utils), `booking`, `providers`, `reviews`, `chatbot` — API calls + domain helpers |
| `services/` | `apiClient.js` (token injection, envelope unwrapping, `ApiError`), catalog/account/admin/storage services |
| `components/` | Reusable UI: `common/` (Button, Input, Select, Modal, Loader, ErrorMessage, EmptyState, Pagination, ConfirmDialog, DataTable…), `layout/`, `providers/`, `booking/`, `reviews/`, `chatbot/`, `search/`, `charts/`, `dashboard/` |
| `pages/` | Route components for `public/`, `customer/`, `provider/`, `admin/` |
| `layouts/` | Public, auth and dashboard shells |
| `routes/` | `AppRoutes` (lazy-loaded pages), `ProtectedRoute` (auth + role), `GuestRoute` |
| `hooks/` | `useAsync`, `usePagedList`, `useCategories`, `useSavedProviders`, `useDebounce`, `useDocumentTitle` |
| `styles/` | Design tokens and responsive CSS (mobile 320px+, tablet 768px+, desktop 1024px+, large 1440px+) |

Role routing: after login the server-provided role selects `/customer/dashboard`, `/provider/dashboard` or `/admin/dashboard`; unauthenticated users are sent to `/login`, wrong-role users to `/unauthorized`. Route guards are a UX convenience — the API enforces the same rules.

## Business rules map

| Rule | Where enforced |
|---|---|
| BR-1 only verified providers in search | `provider.service.js#isPubliclyVisible` (search, profile, slots, booking) + Firestore rules |
| BR-2 review only after completed booking | `review.service.js#createReview` |
| BR-3 provider cannot book own service | `booking.service.js#createBooking`; booking route is customer-only |
| BR-4 only active categories | `category.service.js`, search, service creation, booking |
| BR-5 no overlapping bookings | transactional `createBooking` + `utils/scheduling.js` |
| BR-6 cancellation policy | `booking.policy.js` + `settings/platform` |
| BR-7 only authenticated users book | `booking.routes.js` (`authenticateUser`, `requireCustomer`) |
| BR-8 only admins verify providers | `admin.routes.js` (`requireAdmin`) |
| BR-9 only owner cancels | `booking.service.js#cancelBooking` |
| BR-10 only participants/admins see booking | `booking.service.js#assertCanView` + Firestore rules |

## Mobile readiness

Every capability a mobile app needs is a JSON endpoint (`/api/providers`, `/api/services`, `/api/bookings`, `/api/reviews`, `/api/chatbot`, …) using the same Firebase ID-token auth that Firebase's iOS/Android/Flutter SDKs produce. No business logic lives in React components.
