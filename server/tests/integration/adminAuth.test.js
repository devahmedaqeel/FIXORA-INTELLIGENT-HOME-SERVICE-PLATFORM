import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';

describe('admin authentication & invite-based onboarding', () => {
  let ctx;
  beforeEach(() => {
    ctx = createTestContext();
    ctx.seedMarketplace();
  });

  test('public registration can never self-assign the admin role', async () => {
    ctx.auth.addUser('wannabe1', 'wannabe@test.co.uk');
    const res = await ctx.as('wannabe1').post('/api/auth/register', { role: 'admin', displayName: 'Sneaky' });
    assert.equal(res.status, 400);
    assert.equal(ctx.db.read('users', 'wannabe1'), undefined);
  });

  test('only an admin can create an invite; customers and providers are forbidden', async () => {
    const asCustomer = await ctx.as('cust1').post('/api/admin/invites', { email: 'new-admin@test.co.uk' });
    assert.equal(asCustomer.status, 403);
    const asProvider = await ctx.as('prov1').post('/api/admin/invites', { email: 'new-admin@test.co.uk' });
    assert.equal(asProvider.status, 403);

    const asAdmin = await ctx.as('admin1').post('/api/admin/invites', { email: 'new-admin@test.co.uk' });
    assert.equal(asAdmin.status, 201);
    assert.equal(asAdmin.body.data.email, 'new-admin@test.co.uk');
    assert.ok(asAdmin.body.data.signupUrl.includes('/admin/signup?token='));
  });

  test('a valid invite token grants the admin role to the matching email only', async () => {
    const invite = await ctx.as('admin1').post('/api/admin/invites', { email: 'newadmin@test.co.uk' });
    const token = new URL(invite.body.data.signupUrl).searchParams.get('token');

    ctx.auth.addUser('newadminuid', 'newadmin@test.co.uk');
    const wrongEmail = await ctx.as('newadminuid').post('/api/auth/admin-signup', { token: 'not-the-right-token' });
    assert.equal(wrongEmail.status, 400);

    const redeemed = await ctx.as('newadminuid').post('/api/auth/admin-signup', { token });
    assert.equal(redeemed.status, 201);
    assert.equal(redeemed.body.data.user.role, 'admin');
    assert.equal(ctx.db.read('users', 'newadminuid').role, 'admin');

    // Single-use: redeeming again must fail even for the same (now-registered) account's token.
    ctx.auth.addUser('seconduid', 'newadmin@test.co.uk');
    const reused = await ctx.as('seconduid').post('/api/auth/admin-signup', { token });
    assert.equal(reused.status, 400);
  });

  test('an invite can only be redeemed by the email it was issued for', async () => {
    const invite = await ctx.as('admin1').post('/api/admin/invites', { email: 'onlyfor@test.co.uk' });
    const token = new URL(invite.body.data.signupUrl).searchParams.get('token');

    ctx.auth.addUser('impostor1', 'someoneelse@test.co.uk');
    const res = await ctx.as('impostor1').post('/api/auth/admin-signup', { token });
    assert.equal(res.status, 400);
    assert.equal(ctx.db.read('users', 'impostor1'), undefined);
  });

  test('an invite cannot be created for an email that already has a Fixora account', async () => {
    const res = await ctx.as('admin1').post('/api/admin/invites', { email: 'cust1@test.co.uk' });
    assert.equal(res.status, 409);
  });

  test('admins list and pending invites are only visible to admins', async () => {
    await ctx.as('admin1').post('/api/admin/invites', { email: 'pending@test.co.uk' });

    const adminsList = await ctx.as('admin1').get('/api/admin/admins');
    assert.equal(adminsList.status, 200);
    assert.ok(adminsList.body.data.some((u) => u.uid === 'admin1'));

    const invitesList = await ctx.as('admin1').get('/api/admin/invites');
    assert.equal(invitesList.status, 200);
    assert.equal(invitesList.body.data.length, 1);

    assert.equal((await ctx.as('prov1').get('/api/admin/admins')).status, 403);
    assert.equal((await ctx.as('cust1').get('/api/admin/invites')).status, 403);
  });

  test('a customer or provider cannot reach any /api/admin route', async () => {
    const endpoints = ['/api/admin/dashboard', '/api/admin/users', '/api/admin/commissions', '/api/admin/payment-settings'];
    for (const path of endpoints) {
      assert.equal((await ctx.as('cust1').get(path)).status, 403, path);
      assert.equal((await ctx.as('prov1').get(path)).status, 403, path);
    }
  });
});
