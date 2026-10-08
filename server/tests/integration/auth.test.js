import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';

describe('registration & login', () => {
  let ctx;
  beforeEach(() => {
    ctx = createTestContext();
  });

  test('1. customer registration creates user and customer records', async () => {
    ctx.auth.addUser('newcust', 'newcust@test.pk');
    const res = await ctx.as('newcust').post('/api/auth/register', { role: 'customer', displayName: 'New Customer', phone: '0300 1234567' });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, 'customer');
    assert.equal(ctx.db.read('users', 'newcust').role, 'customer');
    assert.equal(ctx.db.read('users', 'newcust').phone, '03001234567');
    assert.ok(ctx.db.read('customers', 'newcust'));
  });

  test('1b. provider registration starts as pending with default availability', async () => {
    const res = await ctx.as('newprov').post('/api/auth/register', { role: 'provider', displayName: 'New Provider' });
    assert.equal(res.status, 201);
    assert.equal(ctx.db.read('providers', 'newprov').verificationStatus, 'pending');
    assert.ok(ctx.db.read('availability', 'newprov').weekly.monday.enabled);
  });

  test('1c. admin role cannot be self-assigned and duplicate registration is rejected', async () => {
    const admin = await ctx.as('sneaky').post('/api/auth/register', { role: 'admin', displayName: 'Sneaky' });
    assert.equal(admin.status, 400);
    assert.equal(admin.body.errorCode, 'VALIDATION_ERROR');
    assert.equal(ctx.db.read('users', 'sneaky'), undefined);

    await ctx.as('dup').post('/api/auth/register', { role: 'customer', displayName: 'Dup User' });
    const again = await ctx.as('dup').post('/api/auth/register', { role: 'customer', displayName: 'Dup User' });
    assert.equal(again.status, 409);
  });

  test('1d. registration validates input', async () => {
    const res = await ctx.as('bad').post('/api/auth/register', { role: 'customer', displayName: 'A', phone: '123' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(Array.isArray(res.body.details));
  });

  test('2. login verification returns role from Firestore', async () => {
    ctx.seedUser('cust1', 'customer');
    const res = await ctx.as('cust1').post('/api/auth/verify');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.role, 'customer');
  });

  test('2b. invalid or missing tokens are rejected', async () => {
    const missing = await ctx.as(null).post('/api/auth/verify');
    assert.equal(missing.status, 401);
    const invalid = await ctx.as(null).post('/api/auth/verify').set('Authorization', 'Bearer garbage');
    assert.equal(invalid.status, 401);
    assert.equal(invalid.body.errorCode, 'INVALID_TOKEN');
  });

  test('2c. a valid token without a profile cannot use the API', async () => {
    const res = await ctx.as('ghost').get('/api/users/me');
    assert.equal(res.status, 403);
    assert.equal(res.body.errorCode, 'PROFILE_NOT_FOUND');
  });

  test('2d. role in a request body is ignored when updating profile', async () => {
    ctx.seedUser('cust1', 'customer');
    const res = await ctx.as('cust1').put('/api/users/me', { displayName: 'Changed', role: 'admin' });
    assert.equal(res.status, 400); // strict schema rejects unknown fields
    assert.equal(ctx.db.read('users', 'cust1').role, 'customer');
  });
});
