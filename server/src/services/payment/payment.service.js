import { env } from '../../config/environment.js';
import { logger } from '../../utils/logger.js';
import { cashPaymentProvider } from './providers/cash.provider.js';
import { stripePaymentProvider } from './providers/stripe.provider.js';

/*
 * Payment abstraction. Booking code only calls this service; it never knows which
 * gateway is behind it. If the configured gateway is missing credentials or fails,
 * bookings fall back to cash so the platform keeps working.
 */

const providers = { cash: cashPaymentProvider, stripe: stripePaymentProvider };

export function getPaymentProvider() {
  const selected = providers[env.payment.provider];
  return selected && selected.isConfigured() ? selected : cashPaymentProvider;
}

export async function initializeBookingPayment(booking) {
  const provider = getPaymentProvider();
  try {
    return await provider.initializeBookingPayment(booking);
  } catch (error) {
    logger.warn(`Payment provider ${provider.name} failed, falling back to cash: ${error.message}`);
    return cashPaymentProvider.initializeBookingPayment(booking);
  }
}

export async function refundBookingPayment(booking) {
  const provider = providers[booking.paymentMethod] || cashPaymentProvider;
  try {
    return await provider.refundBookingPayment(booking);
  } catch (error) {
    logger.warn(`Refund failed for booking ${booking.id}: ${error.message}`);
    return { refunded: false, reason: 'Refund could not be processed automatically' };
  }
}

export const getPaymentConfig = () => ({ provider: getPaymentProvider().name, currency: env.payment.currency });
