import { asyncHandler, sendSuccess } from '../utils/http.js';
import { getPublicSettings } from '../services/settings.service.js';
import { getPaymentConfig } from '../services/payment/payment.service.js';

export const health = (_req, res) => sendSuccess(res, { data: { status: 'ok', time: new Date().toISOString() } });

/** Public platform configuration (support contacts, cancellation policy, payment mode). */
export const config = asyncHandler(async (_req, res) =>
  sendSuccess(res, { data: { ...(await getPublicSettings()), payment: getPaymentConfig() } }),
);
