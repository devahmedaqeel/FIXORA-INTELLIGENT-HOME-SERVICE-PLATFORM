import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';

describe('notification preferences', () => {
  let ctx;
  beforeEach(() => {
    ctx = createTestContext();
    ctx.seedMarketplace();
  });

  test('a fresh user gets the default preferences without having to set them', async () => {
    const res = await ctx.as('cust1').get('/api/users/me');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.notificationPreferences, {
      bookingUpdates: true,
      reviewUpdates: true,
      accountUpdates: true,
      promotional: true,
      emailEnabled: true,
      smsEnabled: false,
    });
  });

  test('preferences can be updated and persist across reads', async () => {
    const updated = await ctx.as('cust1').put('/api/users/me', {
      notificationPreferences: { bookingUpdates: false, promotional: false, smsEnabled: true },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.notificationPreferences.bookingUpdates, false);
    assert.equal(updated.body.data.notificationPreferences.promotional, false);
    assert.equal(updated.body.data.notificationPreferences.smsEnabled, true);
    // Untouched keys keep their default.
    assert.equal(updated.body.data.notificationPreferences.reviewUpdates, true);

    const reread = await ctx.as('cust1').get('/api/users/me');
    assert.equal(reread.body.data.notificationPreferences.bookingUpdates, false);
  });

  test('a non-boolean preference value is rejected', async () => {
    const res = await ctx.as('cust1').put('/api/users/me', { notificationPreferences: { bookingUpdates: 'yes' } });
    assert.equal(res.status, 400);
  });

  test('an unknown preference key is rejected', async () => {
    const res = await ctx.as('cust1').put('/api/users/me', { notificationPreferences: { carrierPigeon: true } });
    assert.equal(res.status, 400);
  });

  test('providers share the same preferences shape as customers', async () => {
    const res = await ctx.as('prov1').get('/api/users/me');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.notificationPreferences.emailEnabled, true);
  });
});
