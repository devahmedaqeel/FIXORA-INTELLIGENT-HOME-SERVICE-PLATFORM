import { env } from '../../../config/environment.js';
import { logger } from '../../../utils/logger.js';

/*
 * SMS delivery abstraction (SMS_PROVIDER = none | console).
 * To add a gateway (e.g. a Pakistani SMS aggregator), add an adapter here — no
 * booking or review code needs to change.
 */
const adapters = {
  none: async () => ({ delivered: false, skipped: true }),
  console: async ({ to, text }) => {
    logger.info(`[sms:console] to=${to} text="${text.slice(0, 160)}"`);
    return { delivered: true };
  },
};

export const smsChannel = {
  name: 'sms',
  isEnabled: () => env.notifications.smsProvider !== 'none',
  async send(message) {
    const adapter = adapters[env.notifications.smsProvider] || adapters.none;
    return adapter(message);
  },
};
