import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';

describe('notification center categories', () => {
  let ctx;
  beforeEach(() => {
    ctx = createTestContext();
    ctx.seedMarketplace();
  });

  test('a booking notification is tagged with the "booking" UI category', async () => {
    await ctx.as('cust1').post('/api/bookings', ctx.bookingBody());
    const res = await ctx.as('prov1').get('/api/notifications');
    assert.equal(res.status, 200);
    const created = res.body.data.items.find((n) => n.type === 'booking_created');
    assert.ok(created);
    assert.equal(created.category, 'booking');
  });

  test('a review notification is tagged with the "review" UI category', async () => {
    const booking = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody());
    await ctx.as('prov1').patch(`/api/bookings/${booking.body.data.id}/status`, { status: 'confirmed' });
    ctx.setClock('2030-01-08T12:00:00.000Z');
    await ctx.as('prov1').patch(`/api/bookings/${booking.body.data.id}/status`, { status: 'completed' });
    const review = await ctx.as('cust1').post('/api/reviews', { bookingId: booking.body.data.id, rating: 5, comment: 'Great job' });
    assert.equal(review.status, 201);

    const res = await ctx.as('prov1').get('/api/notifications');
    const reviewNotification = res.body.data.items.find((n) => n.type === 'new_review');
    assert.ok(reviewNotification);
    assert.equal(reviewNotification.category, 'review');
  });

  test('a provider verification notification is tagged with the "account" UI category', async () => {
    ctx.seedProvider('pending1', { verificationStatus: 'pending' });
    await ctx.as('admin1').patch('/api/admin/providers/pending1/verification', { status: 'verified', note: 'ok' });
    const res = await ctx.as('pending1').get('/api/notifications');
    const verified = res.body.data.items.find((n) => n.type === 'provider_verified');
    assert.ok(verified);
    assert.equal(verified.category, 'account');
  });
});
