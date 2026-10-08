import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';

describe('reviews & complaints', () => {
  let ctx;
  let bookingId;

  const completeBooking = async (startTime = '10:00', customer = 'cust1') => {
    ctx.setClock('2030-01-07T03:00:00.000Z');
    const res = await ctx.as(customer).post('/api/bookings', ctx.bookingBody({ startTime }));
    await ctx.as('prov1').patch(`/api/bookings/${res.body.data.id}/status`, { status: 'confirmed' });
    ctx.setClock('2030-01-08T12:00:00.000Z');
    await ctx.as('prov1').patch(`/api/bookings/${res.body.data.id}/status`, { status: 'completed' });
    return res.body.data.id;
  };

  beforeEach(async () => {
    ctx = createTestContext();
    ctx.seedMarketplace();
  });

  test('11. reviews require a completed booking owned by the customer (BR-2)', async () => {
    const pending = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ startTime: '15:00' }));
    const early = await ctx.as('cust1').post('/api/reviews', { bookingId: pending.body.data.id, rating: 5 });
    assert.equal(early.status, 400);
    assert.equal(early.body.errorCode, 'REVIEW_NOT_ALLOWED');

    bookingId = await completeBooking();
    const stranger = await ctx.as('cust2').post('/api/reviews', { bookingId, rating: 1 });
    assert.equal(stranger.status, 404);

    const ok = await ctx.as('cust1').post('/api/reviews', { bookingId, rating: 4, comment: 'Good job' });
    assert.equal(ok.status, 201);
    const provider = ctx.db.read('providers', 'prov1');
    assert.equal(provider.ratingAverage, 4);
    assert.equal(provider.ratingCount, 1);
    assert.equal(ctx.db.read('bookings', bookingId).reviewed, true);
  });

  test('11b. duplicate reviews are rejected and averages stay correct', async () => {
    const first = await completeBooking('10:00');
    const second = await completeBooking('12:00');
    await ctx.as('cust1').post('/api/reviews', { bookingId: first, rating: 5 });
    const dup = await ctx.as('cust1').post('/api/reviews', { bookingId: first, rating: 1 });
    assert.equal(dup.status, 409);
    assert.equal(dup.body.errorCode, 'DUPLICATE_REVIEW');

    await ctx.as('cust1').post('/api/reviews', { bookingId: second, rating: 2 });
    assert.equal(ctx.db.read('providers', 'prov1').ratingAverage, 3.5);

    const invalid = await ctx.as('cust1').post('/api/reviews', { bookingId: second, rating: 6 });
    assert.equal(invalid.status, 400);

    // Admin removes the 2-star review → average recomputed from remaining reviews.
    const removed = await ctx.as('admin1').patch(`/api/admin/reviews/${second}`, { status: 'removed', moderationNote: 'Spam' });
    assert.equal(removed.status, 200);
    const provider = ctx.db.read('providers', 'prov1');
    assert.equal(provider.ratingAverage, 5);
    assert.equal(provider.ratingCount, 1);

    const publicReviews = await ctx.as(null).get('/api/providers/prov1/reviews');
    assert.equal(publicReviews.body.data.items.length, 1);
  });

  test('complaints: submit, admin responds, user is notified', async () => {
    bookingId = await completeBooking();
    const res = await ctx.as('cust1').post('/api/complaints', {
      type: 'booking', bookingId, subject: 'Provider was late', description: 'The provider arrived 45 minutes after the slot started.',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.providerId, 'prov1');

    const other = await ctx.as('cust2').post('/api/complaints', {
      type: 'booking', bookingId, subject: 'Not mine', description: 'Trying to complain about a booking I was not part of.',
    });
    assert.equal(other.status, 404);

    const updated = await ctx.as('admin1').patch(`/api/admin/complaints/${res.body.data.id}`, { status: 'resolved', adminResponse: 'We spoke to the provider.' });
    assert.equal(updated.status, 200);
    assert.ok(ctx.db.all('notifications').some((n) => n.userId === 'cust1' && n.type === 'complaint_update'));
  });
});
