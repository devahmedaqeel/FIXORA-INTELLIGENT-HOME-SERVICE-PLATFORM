import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';

describe('role-based authorization', () => {
  let ctx;
  beforeEach(() => {
    ctx = createTestContext();
    ctx.seedMarketplace();
  });

  test('3. each role reaches its own dashboard', async () => {
    assert.equal((await ctx.as('cust1').get('/api/customers/dashboard')).status, 200);
    assert.equal((await ctx.as('prov1').get('/api/providers/dashboard')).status, 200);
    assert.equal((await ctx.as('admin1').get('/api/admin/dashboard')).status, 200);
  });

  test('12. admin can access admin endpoints', async () => {
    const res = await ctx.as('admin1').get('/api/admin/users');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 4);
    const reports = await ctx.as('admin1').get('/api/admin/reports/bookings');
    assert.equal(reports.status, 200);
  });

  test('13. customer cannot access provider-only endpoints', async () => {
    const services = await ctx.as('cust1').post('/api/providers/services', {
      categoryId: 'plumbing', title: 'Fake service', price: 100, pricingType: 'fixed', duration: 60,
    });
    assert.equal(services.status, 403);
    assert.equal((await ctx.as('cust1').put('/api/providers/availability', {})).status, 403);
    assert.equal((await ctx.as('cust1').get('/api/providers/earnings')).status, 403);
  });

  test('14. provider cannot access admin endpoints', async () => {
    assert.equal((await ctx.as('prov1').get('/api/admin/dashboard')).status, 403);
    const verify = await ctx.as('prov1').patch('/api/admin/providers/prov1/verification', { status: 'verified' });
    assert.equal(verify.status, 403);
    assert.equal((await ctx.as('prov1').post('/api/categories', { name: 'Hacked' })).status, 403);
  });

  test('customer cannot access admin endpoints and anonymous users cannot book (BR-7)', async () => {
    assert.equal((await ctx.as('cust1').get('/api/admin/users')).status, 403);
    assert.equal((await ctx.as(null).post('/api/bookings', ctx.bookingBody())).status, 401);
  });

  test('suspended accounts are blocked', async () => {
    const res = await ctx.as('admin1').patch('/api/admin/users/cust1/status', { status: 'suspended', reason: 'Abuse' });
    assert.equal(res.status, 200);
    const blocked = await ctx.as('cust1').get('/api/users/me');
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body.errorCode, 'ACCOUNT_SUSPENDED');
  });

  test('admin cannot suspend themselves', async () => {
    const res = await ctx.as('admin1').patch('/api/admin/users/admin1/status', { status: 'suspended' });
    assert.equal(res.status, 400);
  });
});
