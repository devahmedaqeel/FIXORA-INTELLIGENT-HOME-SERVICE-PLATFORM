import dotenv from 'dotenv';

dotenv.config();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const list = (value, fallback = []) =>
  value ? value.split(',').map((item) => item.trim()).filter(Boolean) : fallback;

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: toInt(process.env.PORT, 5000),
  clientUrls: list(process.env.CLIENT_URL, ['http://localhost:5173']),

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    // .env files store newlines as the two characters "\n"
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    credentialsFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  },

  ai: {
    provider: (process.env.AI_PROVIDER || 'none').toLowerCase(),
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || '',
    timeoutMs: toInt(process.env.AI_TIMEOUT_MS, 15000),
  },

  notifications: {
    emailProvider: (process.env.EMAIL_PROVIDER || 'console').toLowerCase(),
    emailFrom: process.env.EMAIL_FROM || 'Fixora <no-reply@fixora.pk>',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: toInt(process.env.SMTP_PORT, 587),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    resendApiKey: process.env.RESEND_API_KEY || '',
    smsProvider: (process.env.SMS_PROVIDER || 'none').toLowerCase(),
  },

  payment: {
    provider: (process.env.PAYMENT_PROVIDER || 'cash').toLowerCase(),
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    currency: (process.env.PAYMENT_CURRENCY || 'gbp').toLowerCase(),
  },

  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 300),
  },
});

/** Fails fast at boot when the server cannot reach Firebase. */
export function assertServerConfig() {
  const { projectId, clientEmail, privateKey, credentialsFile } = env.firebase;
  const hasInlineCredentials = projectId && clientEmail && privateKey;
  if (!hasInlineCredentials && !credentialsFile) {
    throw new Error(
      'Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and ' +
        'FIREBASE_PRIVATE_KEY (or GOOGLE_APPLICATION_CREDENTIALS) in server/.env — see docs/SETUP.md.',
    );
  }
}
