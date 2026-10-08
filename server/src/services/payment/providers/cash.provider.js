/** Default payment mode: the customer pays the provider in cash after the job. */
export const cashPaymentProvider = {
  name: 'cash',
  isConfigured: () => true,
  async initializeBookingPayment() {
    return { paymentMethod: 'cash', paymentStatus: 'cash' };
  },
  async refundBookingPayment() {
    return { refunded: false, reason: 'Cash payments are settled directly with the provider' };
  },
};
