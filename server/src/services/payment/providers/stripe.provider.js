import { env } from '../../../config/environment.js';

/*
 * Optional Stripe adapter using Stripe's REST API directly (no SDK dependency).
 * Activated with PAYMENT_PROVIDER=stripe and STRIPE_SECRET_KEY. The client would
 * confirm the returned PaymentIntent with Stripe.js; until then the booking stays "unpaid".
 */

const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeRequest(path, params) {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.payment.stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || `Stripe responded with ${response.status}`);
  return body;
}

export const stripePaymentProvider = {
  name: 'stripe',
  isConfigured: () => Boolean(env.payment.stripeSecretKey),

  async initializeBookingPayment(booking) {
    // Stripe amounts are in the smallest currency unit (pence for GBP).
    const intent = await stripeRequest('/payment_intents', {
      amount: String(Math.round(Number(booking.price) * 100)),
      currency: env.payment.currency,
      'metadata[bookingId]': booking.id,
      'automatic_payment_methods[enabled]': 'true',
    });
    return {
      paymentMethod: 'stripe',
      paymentStatus: 'unpaid',
      paymentReference: intent.id,
      clientSecret: intent.client_secret,
    };
  },

  async refundBookingPayment(booking) {
    if (!booking.paymentReference) return { refunded: false, reason: 'No payment reference on booking' };
    const refund = await stripeRequest('/refunds', { payment_intent: booking.paymentReference });
    return { refunded: refund.status === 'succeeded' || refund.status === 'pending', reference: refund.id };
  },
};
