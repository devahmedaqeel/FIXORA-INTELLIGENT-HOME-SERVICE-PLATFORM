# Fixora

**Intelligent Home Service Platform** — a full-stack marketplace connecting customers in Pakistan with verified local home-service providers: plumbers, electricians, cleaners, AC technicians, carpenters, painters, tutors and more.

## Features

* **Customer marketplace** — search by service category plus area name or 5-digit postal code, compare ratings and prices, save favourites
* **Verified providers** — every provider starts as *pending* and is hidden from search until an admin approves them
* **Area / ZIP search** — database-driven Pakistani locations (area, city, district, province, postal code); no map APIs
* **Booking & scheduling** — weekly availability, days off, slot generation from service duration, transactional **double-booking prevention**
* **Cancellation policy** — free until a configurable cutoff (default 2 hours), then warn / fee / block
* **Reviews & ratings** — only after completed bookings, one per booking, averages maintained transactionally
* **Provider tools** — profile, photo & document uploads, services and prices, availability, booking management, earnings
* **Admin panel** — users, providers & verification, categories, areas, bookings, reviews, complaints, reports, chatbot queries, platform settings
* **AI chatbot** — FAQ answers offline, personal booking/earnings answers scoped to the signed-in user, optional OpenAI / Anthropic / Gemini, logged fallbacks with human-support handoff
* **Notifications** — in-app notifications with pluggable email/SMS channels
* **Firebase backend** — Authentication, Cloud Firestore, Storage, security rules and indexes
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
│       ├── components/  common · layout · providers · booking · reviews · chatbot · search · charts · dashboard
│       ├── features/    auth · booking · providers · reviews · chatbot (API + domain helpers)
│       ├── pages/       public · customer · provider · admin
│       ├── layouts/ routes/ hooks/ services/ context/ constants/ utils/ styles/
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

# 4. Seed categories, Pakistan areas and (optionally) demo data
npm run seed:demo

# 5. Create your own admin account
npm run create-admin -- --email you@example.com --password "StrongPass123" --name "Your Name"

# 6. Start API (http://localhost:5000) and web app (http://localhost:5173)
npm run dev
```

Demo accounts created by `seed:demo` all use the password `Demo@12345` (e.g. `admin@fixora.demo`, `ayesha@fixora.demo`, `usman.plumber@fixora.demo`).

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

## Documentation

* [Setup](docs/SETUP.md) — local development, Firebase, environment variables, seeding, build
* [API](docs/API.md) — every endpoint, request/response formats and error codes
* [Database](docs/DATABASE.md) — Firestore collections, fields, indexes, Storage layout
* [Architecture](docs/ARCHITECTURE.md) — layers, booking engine, security, chatbot design, business-rule map

## Security notes

* Roles are read from Firestore on every request; the client cannot assign or escalate roles.
* Secrets live only in `.env` files (git-ignored). Firebase web config is public by design; the Admin private key and AI/payment keys are server-only.
* Firestore and Storage rules deny by default and never use `allow read, write: if true`.
* Inputs are validated with strict schemas; unknown fields are rejected. Errors never leak stack traces.
