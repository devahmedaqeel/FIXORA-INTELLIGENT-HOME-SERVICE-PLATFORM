# Fixora setup guide

This guide takes you from a fresh machine to Fixora running locally with real Firebase data.

## 1. Prerequisites

* **Node.js 20 LTS or newer** (18.18+ works) — https://nodejs.org. Check with `node -v` and `npm -v`.
* A **Google account** for Firebase.
* Optional: **Firebase CLI** for deploying rules/indexes: `npm install -g firebase-tools`, then `firebase login`.

## 2. Install dependencies

From the project root:

```bash
npm run install:all
```

This installs the root tooling (`concurrently`), the API (`server/`) and the React app (`client/`, built with Vite).

## 3. Create the Firebase project

1. Open https://console.firebase.google.com → **Add project** → name it (e.g. `fixora`). Google Analytics is optional.
2. **Authentication** → *Get started* → *Sign-in method* → enable **Email/Password**.
   * *Templates* lets you customise verification and password-reset emails.
   * *Settings → Authorized domains*: `localhost` is included; add your production domain later.
3. **Firestore Database** → *Create database* → **Production mode** → choose a location close to Pakistan (e.g. `asia-south1` Mumbai). The location cannot be changed later.
4. **Storage** → *Get started* → production mode → same region. (New projects may need the Blaze plan for Storage; the app runs without uploads if Storage is unavailable — photos/documents are simply disabled.)

## 4. Web app credentials (client)

1. *Project settings* (gear) → *General* → *Your apps* → **Web (`</>`)** → register an app (no hosting needed).
2. Copy the `firebaseConfig` values.
3. Create `client/.env`:

```bash
cp client/.env.example client/.env
```

```ini
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=fixora-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fixora-xxxx
VITE_FIREBASE_STORAGE_BUCKET=fixora-xxxx.appspot.com   # or .firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
VITE_API_BASE_URL=/api
VITE_DEV_API_TARGET=http://localhost:5000
```

`VITE_API_BASE_URL=/api` uses the Vite dev proxy, so no CORS setup is needed locally.

## 5. Service account (server)

1. *Project settings* → **Service accounts** → **Generate new private key** → download the JSON. **Never commit this file.**
2. Create `server/.env`:

```bash
cp server/.env.example server/.env
```

Copy three values from the JSON:

```ini
FIREBASE_PROJECT_ID=fixora-xxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@fixora-xxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=fixora-xxxx.appspot.com
CLIENT_URL=http://localhost:5173
```

Keep the private key in double quotes with `\n` for newlines. Alternatively, place the JSON file outside the repo and set `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json` instead of the three variables.

### Optional integrations (`server/.env`)

| Feature | Variables | Notes |
|---|---|---|
| AI chatbot | `AI_PROVIDER=openai\|anthropic\|gemini`, `AI_API_KEY`, `AI_MODEL` (optional) | Without them the assistant answers from its FAQ and account data |
| Email notifications | `EMAIL_PROVIDER=console\|smtp\|resend\|none`, `EMAIL_FROM`, `SMTP_*` or `RESEND_API_KEY` | `console` logs emails to the server terminal |
| SMS | `SMS_PROVIDER=console\|none` | Adapter point for a future SMS gateway |
| Payments | `PAYMENT_PROVIDER=cash\|stripe`, `STRIPE_SECRET_KEY` | Cash is the default; Stripe is optional |

## 6. Deploy security rules and indexes

```bash
firebase use --add            # pick your project
npm run deploy:rules          # firestore.rules, firestore.indexes.json, storage.rules
```

Index builds take a few minutes. Without the CLI you can paste `firebase/firestore.rules` and `firebase/storage.rules` into the console's *Rules* tabs; missing indexes produce an error with a one-click creation link the first time a query runs.

## 7. Seed data

```bash
npm run seed         # 12 categories, 60+ Pakistan areas with postal codes, platform settings
npm run seed:demo    # the above + demo admin, customers, providers, services, reviews
```

Demo accounts (password `Demo@12345` for all — change or delete before going live):

| Role | Email |
|---|---|
| Admin | admin@fixora.demo |
| Customer | ayesha@fixora.demo, bilal@fixora.demo |
| Provider (verified) | usman.plumber@fixora.demo, sana.cleaning@fixora.demo, hamza.electric@fixora.demo, farah.tutor@fixora.demo |
| Provider (pending) | kamran.pending@fixora.demo |

Create a real administrator (admin can never be self-registered):

```bash
npm run create-admin -- --email you@example.com --password "StrongPass123" --name "Your Name"
```

If the email already exists in Firebase Auth, that account is promoted to admin.

## 8. Run locally

```bash
npm run dev
```

* React app: http://localhost:5173
* API: http://localhost:5000/api (health check: `/api/health`)

Or run them separately: `npm run dev:server` and `npm run dev:client`.

Try it: search **Plumbing** + postal code **10250** on the home page, open *Raza Plumbing Works*, sign in as `ayesha@fixora.demo`, book a slot, then sign in as `usman.plumber@fixora.demo` to accept it.

## 9. Tests

```bash
npm test
```

Runs the API test suite (Node's built-in test runner + supertest) against an in-memory Firestore/Auth double — no Firebase project or network needed. It covers registration, login, role authorization, provider verification, services, area and ZIP search, booking creation, double-booking (including concurrent requests), cancellation policy, reviews, complaints, admin access and chatbot privacy.

## 10. Production build

```bash
npm run build        # outputs client/dist
npm start            # starts the API (NODE_ENV=production recommended)
```

* Host `client/dist` on any static host (Firebase Hosting, Netlify, Vercel, Nginx). Configure SPA fallback to `index.html`.
* Set `VITE_API_BASE_URL` to the API's public URL (e.g. `https://api.fixora.pk/api`) **before** building.
* Run the API on Cloud Run, Render, Railway, a VM, etc. Set `NODE_ENV=production`, `CLIENT_URL=https://your-frontend-domain` and the Firebase variables as environment secrets.
* Add the frontend domain to Firebase Auth → *Authorized domains*.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Fixora needs Firebase configuration" page | `client/.env` missing values; restart `npm run dev` after editing |
| Server exits with "Firebase Admin credentials are missing" | Fill `server/.env` (step 5) |
| `FAILED_PRECONDITION: The query requires an index` | Run `npm run deploy:rules` or click the link in the error |
| 403 `PROFILE_NOT_FOUND` after sign-up | Sign-up was interrupted; open `/register` — the form completes the profile |
| CORS error in production | Add the frontend origin to `CLIENT_URL` (comma-separated list) |
| Uploads fail | Enable Firebase Storage and deploy `storage.rules` |
