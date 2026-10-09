# Fixora

**Intelligent Home Service Platform** — a full-stack marketplace connecting customers in the United Kingdom with verified local home-service providers: plumbers, electricians, cleaners, heating engineers, carpenters, painters, tutors and more.

## Quick links (after `npm run dev`)

Run `npm run dev` from the project root first (starts the API on :5000 and the web app on :5173) — then open either portal directly:

| | |
|---|---|
| 🔐 **Admin portal** | [http://localhost:5173/admin/login](http://localhost:5173/admin/login) — separate login, separate layout from the public/customer site. Demo: `admin@fixora.com` / `Admin@123` |
| 🌐 **Customer / provider site** | [http://localhost:5173/](http://localhost:5173/) — public marketplace, customer & provider sign-in is at `/login`. Demo: `customer@fixora.com` / `Customer@123` or `provider@fixora.com` / `Provider@123` |

These are two completely separate areas of the app — the admin portal has its own layout, sidebar and auth, and is never reachable from the public site's sign-in page. See [Admin portal](#admin-portal) below for how admin accounts are created securely.

## Features

* **Customer marketplace** — search by service category plus area name or postcode, compare ratings and prices, save favourites
* **Verified providers** — every provider starts as *pending* and is hidden from search until an admin approves them
* **Area / postcode search** — database-driven UK locations (area, city, district, province, postcode); no map APIs
* **Booking & scheduling** — weekly availability, days off, slot generation from service duration, transactional **double-booking prevention**
* **Cancellation policy** — free until a configurable cutoff (default 2 hours), then warn / fee / block
* **Messaging** — in-thread customer ↔ provider chat scoped to a single booking
* **Reviews & ratings** — only after completed bookings, one per booking, averages maintained transactionally
* **Provider tools** — guided onboarding wizard, profile, photo & document uploads, services and prices, availability, booking management, earnings, commissions
* **Independent admin portal** — its own layout, login and signup, completely separate from the customer/provider dashboards (see [Admin portal](#admin-portal) below)
* **Financial management** — dual customer/provider payment confirmation, automatic idempotent commission calculation, provider payment submission with proof upload, admin verification/rejection/partial-payment/waiver, a full immutable audit log, and financial reports
* **Admin panel** — users, customers, providers & verification, categories, areas, bookings, reviews, complaints, payments, commissions, audit logs, reports, chatbot queries, platform & payment settings
* **AI chatbot** — FAQ answers offline, personal booking/earnings answers scoped to the signed-in user, optional OpenAI / Anthropic / Gemini, logged fallbacks with human-support handoff
* **Notifications** — in-app notifications with pluggable email/SMS channels
* **Firebase backend** — Authentication, Cloud Firestore, Storage, security rules and indexes
* **SEO-aware** — public pages stay indexable (`robots.txt` / `sitemap.xml`); every private dashboard (admin, customer, provider) is served with `noindex, nofollow`
* **Mobile-ready API** — all business rules live in the REST API so a future mobile app can reuse it as-is

## Technology

| Layer | Stack |
|---|---|
| Frontend | React 18, React Router 6, Vite, plain responsive CSS (no UI framework) |
| Backend | Node.js, Express 4, zod validation, helmet, CORS, express-rate-limit |
| Data & auth | Firebase Authentication, Cloud Firestore, Firebase Storage, Firebase Admin SDK |
| Tests | Node built-in test runner + supertest with an in-memory Firestore double |

## Project structure

```
Fixora/
├── client/            React web app (Vite)
│   └── src/
│       ├── components/  common · layout · admin · providers · booking · reviews · chatbot · search · charts · dashboard
│       ├── features/    auth · booking · providers · reviews · chatbot (API + domain helpers)
│       ├── pages/       public · customer · provider · admin
│       ├── layouts/     PublicLayout · AuthLayout · DashboardLayout (customer/provider) · AdminLayout (admin, independent)
│       ├── routes/ hooks/ services/ context/ constants/ utils/ styles/
│       └── firebase.js
├── server/            Express REST API
│   ├── src/
│   │   ├── config/ middleware/ routes/ controllers/ services/ repositories/
│   │   ├── validators/ utils/ constants/ chatbot/ reports/
│   │   ├── app.js
│   │   └── server.js
│   └── tests/         unit + integration tests
├── firebase/          firestore.rules · storage.rules · firestore.indexes.json · seed/
├── docs/              SETUP · API · DATABASE · ARCHITECTURE
└── firebase.json
```

## Installation

Requirements: Node.js 20+ (18.18+ supported) and a Firebase project.

```bash
# 1. Install everything
npm run install:all

# 2. Configure environment (see docs/SETUP.md for where each value comes from)
cp client/.env.example client/.env     # Firebase web config
cp server/.env.example server/.env     # Firebase service account

# 3. Deploy Firestore/Storage rules and indexes (Firebase CLI)
firebase use --add
npm run deploy:rules

# 4. Seed categories, UK areas and (optionally) demo data
npm run seed:demo

# 5. Create your own admin account
npm run create-admin -- --email you@example.com --password "StrongPass123" --name "Your Name"

# 6. Start API (http://localhost:5000) and web app (http://localhost:5173)
npm run dev
```

Quick demo login (created by `seed:demo`): `admin@fixora.com` / `Admin@123` at **`/admin/login`**, `customer@fixora.com` / `Customer@123` and `provider@fixora.com` / `Provider@123` at `/login`. Every other seeded account uses the password `Demo@12345`.

Full step-by-step instructions, including Firebase console setup, optional AI/email/payment integrations and deployment: **[docs/SETUP.md](docs/SETUP.md)**.

## Scripts (root)

| Script | Action |
|---|---|
| `npm run install:all` | Install root, server and client dependencies |
| `npm run dev` | Run API and web app together |
| `npm test` | Run the API test suite (no Firebase needed) |
| `npm run build` | Production build of the web app (`client/dist`) |
| `npm start` | Start the API |
| `npm run seed` / `seed:demo` | Seed Firestore |
| `npm run create-admin -- --email … --password …` | Create or promote an admin |
| `npm run deploy:rules` | Deploy Firestore/Storage rules and indexes |

## Admin portal

The admin portal is a fully independent application area — separate layout, separate `/admin/login` and `/admin/signup`, no shared UI with the customer/provider dashboards, and `noindex, nofollow` on every page.

**The admin role can never be self-assigned.** Public registration only ever accepts `role: customer` or `role: provider` (enforced server-side, not just hidden in the UI). There are exactly two ways to create an admin account:

1. **First admin (trusted operator, CLI only):**
   ```bash
   npm run create-admin -- --email you@example.com --password "StrongPass123" --name "Your Name"
   ```
   Runs with the Firebase Admin SDK directly — never exposed over HTTP.

2. **Every admin after that (invite-based, in-app):** an existing admin opens `/admin/team`, enters an email, and gets a one-time signup link. That link is valid for **48 hours**, works **exactly once**, and is **locked to the exact email it was issued for** — the server verifies all of this inside a Firestore transaction before granting the role, so a token can never be redeemed twice even under concurrent requests. The underlying invite record itself is unreadable by any client, including an admin's own browser; redemption only ever happens through the Admin SDK on the server.

Admin login re-verifies the role server-side after every sign-in and signs the user straight back out if the account isn't an admin — a customer or provider credential cannot get into the admin portal even momentarily.

## Documentation

* [Setup](docs/SETUP.md) — local development, Firebase, environment variables, seeding, build
* [API](docs/API.md) — every endpoint, request/response formats and error codes
* [Database](docs/DATABASE.md) — Firestore collections, fields, indexes, Storage layout
* [Architecture](docs/ARCHITECTURE.md) — layers, booking engine, security, chatbot design, business-rule map

## Security notes

* Roles are read from Firestore on every request; the client cannot assign or escalate roles. The admin role specifically can only be granted via the CLI script or a verified single-use invite (see [Admin portal](#admin-portal)).
* Secrets live only in `.env` files (git-ignored). Firebase web config is public by design; the Admin private key and AI/payment keys are server-only.
* Firestore and Storage rules deny by default and never use `allow read, write: if true`. Financial collections (`payments`, `commissions`, `auditLogs`, `adminInvites`) are writable only by the server's Admin SDK — a provider cannot flip their own commission to "paid" from DevTools, and nobody can read an invite token directly from Firestore.
* Payment status is never inferred from a provider marking a job "completed" — it requires explicit, independent confirmation from both the customer and the provider before a commission is even generated.
* Inputs are validated with strict schemas; unknown fields are rejected. Errors never leak stack traces.
