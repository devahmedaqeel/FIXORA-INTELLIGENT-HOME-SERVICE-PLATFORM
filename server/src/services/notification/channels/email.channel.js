import { env } from '../../../config/environment.js';
import { logger } from '../../../utils/logger.js';

/*
 * Email delivery abstraction. Business logic calls notificationService.notify();
 * this channel decides HOW an email is sent, selected by EMAIL_PROVIDER:
 *   none | console | smtp | resend
 */

let smtpTransport = null;

async function getSmtpTransport() {
  if (smtpTransport) return smtpTransport;
  const { default: nodemailer } = await import('nodemailer');
  const { host, port, user, pass } = env.notifications.smtp;
  smtpTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });
  return smtpTransport;
}

const adapters = {
  none: async () => ({ delivered: false, skipped: true }),

  console: async ({ to, subject, text }) => {
    logger.info(`[email:console] to=${to} subject="${subject}" body="${text.slice(0, 160)}"`);
    return { delivered: true };
  },

  smtp: async ({ to, subject, text, html }) => {
    if (!env.notifications.smtp.host) throw new Error('SMTP_HOST is not configured');
    const transport = await getSmtpTransport();
    await transport.sendMail({ from: env.notifications.emailFrom, to, subject, text, html });
    return { delivered: true };
  },

  resend: async ({ to, subject, text, html }) => {
    if (!env.notifications.resendApiKey) throw new Error('RESEND_API_KEY is not configured');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.notifications.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: env.notifications.emailFrom, to: [to], subject, text, html }),
    });
    if (!response.ok) throw new Error(`Resend responded with ${response.status}`);
    return { delivered: true };
  },
};

export const emailChannel = {
  name: 'email',
  isEnabled: () => env.notifications.emailProvider !== 'none',
  async send(message) {
    const adapter = adapters[env.notifications.emailProvider] || adapters.none;
    return adapter(message);
  },
};
