import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext, BOOKING_DATE } from '../helpers/context.js';

describe('booking system', () => {
  let ctx;
  beforeEach(() => {
    ctx = createTestContext();
    ctx.seedMarketplace();
  });

  test('8. customer can create a booking and both parties are notified', async () => {
    const res = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ customerNotes: 'Kitchen tap' }));
    assert.equal(res.status, 201);
    assert.equal(res.body.message, 'Booking created successfully');
    const booking = ctx.db.read('bookings', res.body.data.id);
    assert.equal(booking.status, 'pending');
    assert.equal(booking.endTime, '11:00');
    assert.equal(booking.paymentStatus, 'cash');
    assert.equal(booking.customerId, 'cust1');
    const notified = ctx.db.all('notifications').map((n) => n.userId).sort();
    assert.deepEqual(notified, ['cust1', 'prov1']);
  });

  test('9. double booking is prevented for overlapping times', async () => {
    const first = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ startTime: '10:00' }));
    assert.equal(first.status, 201);
    const overlap = await ctx.as('cust2').post('/api/bookings', ctx.bookingBody({ startTime: '10:30' }));
    assert.equal(overlap.status, 409);
    assert.equal(overlap.body.errorCode, 'BOOKING_CONFLICT');
    const backToBack = await ctx.as('cust2').post('/api/bookings', ctx.bookingBody({ startTime: '11:00' }));
    assert.equal(backToBack.status, 201);
  });

  test('9b. concurrent requests for the same slot produce exactly one booking', async () => {
    const attempts = await Promise.all(
      ['cust1', 'cust2', 'cust1', 'cust2', 'cust1'].map((uid) => ctx.as(uid).post('/api/bookings', ctx.bookingBody({ startTime: '13:00' }))),
    );
    const statuses = attempts.map((r) => r.status).sort();
    assert.deepEqual(statuses, [201, 409, 409, 409, 409]);
    assert.equal(ctx.db.all('bookings').length, 1);
  });

  test('slots endpoint hides booked times', async () => {
    await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ startTime: '10:00' }));
    const res = await ctx.as(null).get(`/api/providers/prov1/slots?date=${BOOKING_DATE}&serviceId=svc1`);
    assert.equal(res.status, 200);
    const starts = res.body.data.slots.map((s) => s.startTime);
    assert.ok(!starts.includes('10:00') && !starts.includes('09:30') && !starts.includes('10:30'));
    assert.ok(starts.includes('09:00') && starts.includes('11:00'));
  });

  test('bookings outside availability or for unverified providers are rejected', async () => {
    const early = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ startTime: '07:00' }));
    assert.equal(early.status, 409);
    assert.equal(early.body.errorCode, 'SLOT_UNAVAILABLE');

    ctx.seedProvider('pending1', { verificationStatus: 'pending' });
    ctx.seedService('svcP', 'pending1');
    const unverified = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ providerId: 'pending1', serviceId: 'svcP' }));
    assert.equal(unverified.status, 400);
    assert.equal(unverified.body.errorCode, 'PROVIDER_NOT_VERIFIED');

    const past = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ bookingDate: '2029-12-31' }));
    assert.equal(past.status, 400);
  });

  test('providers cannot create bookings (BR-3) and services must belong to the provider', async () => {
    assert.equal((await ctx.as('prov1').post('/api/bookings', ctx.bookingBody())).status, 403);
    ctx.seedProvider('prov2');
    ctx.seedService('svc2', 'prov2');
    const mismatch = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ serviceId: 'svc2' }));
    assert.equal(mismatch.status, 404);
  });

  test('10. customer cancels free before cutoff; late cancellation needs acknowledgement', async () => {
    const early = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ startTime: '10:00' }));
    const cancelled = await ctx.as('cust1').patch(`/api/bookings/${early.body.data.id}/cancel`, { reason: 'Plans changed' });
    assert.equal(cancelled.status, 200);
    assert.equal(ctx.db.read('bookings', early.body.data.id).status, 'cancelled');
    assert.equal(ctx.db.read('bookings', early.body.data.id).lateCancellation, false);

    const late = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ startTime: '14:00' }));
    ctx.setClock('2030-01-08T13:00:00.000Z'); // 13:00 GMT → 60 min before
    const preview = await ctx.as('cust1').get(`/api/bookings/${late.body.data.id}/cancellation-preview`);
    assert.equal(preview.body.data.isLate, true);

    const needsAck = await ctx.as('cust1').patch(`/api/bookings/${late.body.data.id}/cancel`, {});
    assert.equal(needsAck.status, 409);
    assert.equal(needsAck.body.errorCode, 'LATE_CANCELLATION_CONFIRMATION_REQUIRED');

    const acknowledged = await ctx.as('cust1').patch(`/api/bookings/${late.body.data.id}/cancel`, { acknowledgeLateCancellation: true });
    assert.equal(acknowledged.status, 200);
    assert.equal(ctx.db.read('bookings', late.body.data.id).lateCancellation, true);
  });

  test('10b. admin-configured "block" policy prevents late cancellation', async () => {
    const saved = await ctx.as('admin1').put('/api/admin/settings', { lateCancellationPolicy: 'block', bookingCancellationCutoffMinutes: 180 });
    assert.equal(saved.status, 200);
    const booking = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ startTime: '14:00' }));
    ctx.setClock('2030-01-08T12:00:00.000Z'); // 12:00 GMT → 120 min before, inside 180
    const res = await ctx.as('cust1').patch(`/api/bookings/${booking.body.data.id}/cancel`, { acknowledgeLateCancellation: true });
    assert.equal(res.status, 409);
    assert.equal(res.body.errorCode, 'CANCELLATION_NOT_ALLOWED');
  });

  test('only the booking owner can cancel, only participants can view (BR-9, BR-10)', async () => {
    const booking = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody());
    const id = booking.body.data.id;
    assert.equal((await ctx.as('cust2').patch(`/api/bookings/${id}/cancel`, {})).status, 404);
    assert.equal((await ctx.as('cust2').get(`/api/bookings/${id}`)).status, 404);
    assert.equal((await ctx.as('prov1').get(`/api/bookings/${id}`)).status, 200);
    assert.equal((await ctx.as('admin1').get(`/api/bookings/${id}`)).status, 200);
    ctx.seedProvider('prov2');
    assert.equal((await ctx.as('prov2').get(`/api/bookings/${id}`)).status, 404);
  });

  test('provider manages booking lifecycle with valid transitions only', async () => {
    const booking = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody());
    const id = booking.body.data.id;
    assert.equal((await ctx.as('cust1').patch(`/api/bookings/${id}/status`, { status: 'confirmed' })).status, 403);

    assert.equal((await ctx.as('prov1').patch(`/api/bookings/${id}/status`, { status: 'confirmed' })).status, 200);
    const invalid = await ctx.as('prov1').patch(`/api/bookings/${id}/status`, { status: 'pending' });
    assert.equal(invalid.body.errorCode, 'INVALID_STATUS_TRANSITION');

    // Cannot complete before the booking date.
    assert.equal((await ctx.as('prov1').patch(`/api/bookings/${id}/status`, { status: 'completed' })).status, 400);
    ctx.setClock('2030-01-08T10:00:00.000Z');
    const done = await ctx.as('prov1').patch(`/api/bookings/${id}/status`, { status: 'completed', providerNotes: 'Fixed' });
    assert.equal(done.status, 200);
    assert.equal(ctx.db.read('providers', 'prov1').completedBookings, 1);

    const list = await ctx.as('prov1').get('/api/bookings/my?status=completed');
    assert.equal(list.body.data.length, 1);
    const earnings = await ctx.as('prov1').get('/api/providers/earnings');
    assert.equal(earnings.body.data.summary.totalEarnings, 1000);
  });
});
