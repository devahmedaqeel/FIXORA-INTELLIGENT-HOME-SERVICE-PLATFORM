import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';

describe('providers, services and search', () => {
  let ctx;
  beforeEach(() => {
    ctx = createTestContext();
    ctx.seedMarketplace();
    ctx.seedArea('manchester-centre', { areaName: 'City Centre', city: 'Manchester', district: 'Greater Manchester', province: 'England', postalCode: 'M1 1AE' });
    ctx.seedProvider('pending1', { verificationStatus: 'pending' });
    ctx.seedService('svcPending', 'pending1');
  });

  test('4. pending providers are hidden until an admin verifies them (BR-1, BR-8)', async () => {
    const before = await ctx.as(null).get('/api/providers?categoryId=plumbing&areaId=mirpur');
    assert.deepEqual(before.body.data.items.map((r) => r.provider.id), ['prov1']);
    assert.equal((await ctx.as(null).get('/api/providers/pending1')).status, 404);

    const verify = await ctx.as('admin1').patch('/api/admin/providers/pending1/verification', { status: 'verified', note: 'Documents OK' });
    assert.equal(verify.status, 200);
    assert.equal(ctx.db.read('providers', 'pending1').verificationStatus, 'verified');
    assert.ok(ctx.db.all('notifications').some((n) => n.userId === 'pending1' && n.type === 'provider_verified'));

    const after = await ctx.as(null).get('/api/providers?categoryId=plumbing&areaId=mirpur');
    assert.equal(after.body.data.items.length, 2);

    await ctx.as('admin1').patch('/api/admin/providers/pending1/verification', { status: 'suspended' });
    const suspended = await ctx.as(null).get('/api/providers?categoryId=plumbing&areaId=mirpur');
    assert.equal(suspended.body.data.items.length, 1);
  });

  test('5. provider can create, update and delete services', async () => {
    const created = await ctx.as('prov1').post('/api/providers/services', {
      categoryId: 'plumbing', title: 'Geyser installation', description: 'Gas geyser', price: 3500, pricingType: 'starting_from', duration: 120,
    });
    assert.equal(created.status, 201);
    const id = created.body.data.id;
    assert.equal(ctx.db.read('services', id).providerId, 'prov1');

    const updated = await ctx.as('prov1').put(`/api/providers/services/${id}`, { price: 4000, active: false });
    assert.equal(updated.status, 200);
    assert.equal(ctx.db.read('services', id).price, 4000);

    // Another provider cannot touch it.
    ctx.seedProvider('prov2');
    assert.equal((await ctx.as('prov2').put(`/api/providers/services/${id}`, { price: 1 })).status, 404);

    const removed = await ctx.as('prov1').delete(`/api/providers/services/${id}`);
    assert.equal(removed.status, 200);
    assert.equal(ctx.db.read('services', id), undefined);
  });

  test('5b. service validation rejects bad input', async () => {
    const res = await ctx.as('prov1').post('/api/providers/services', {
      categoryId: 'plumbing', title: 'X', price: -5, pricingType: 'weekly', duration: 5,
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.details.length >= 3);
  });

  test('6. area search matches by name and city', async () => {
    const res = await ctx.as(null).get('/api/areas/search?q=camden');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.map((a) => a.id), ['mirpur']);
    const byCity = await ctx.as(null).get('/api/areas/search?q=manchester');
    assert.equal(byCity.body.data[0].postalCode, 'M1 1AE');
  });

  test('7. postcode search finds providers serving that code', async () => {
    const res = await ctx.as(null).get('/api/providers?categoryId=plumbing&postalCode=NW1%206XE');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.items[0].provider.id, 'prov1');
    assert.equal(res.body.data.items[0].startingPrice, 1000);
    assert.equal(res.body.data.context.areasForPostalCode[0].areaName, 'Camden');

    const none = await ctx.as(null).get('/api/providers?categoryId=plumbing&postalCode=M1%201AE');
    assert.equal(none.body.data.items.length, 0);

    const invalid = await ctx.as(null).get('/api/providers?postalCode=12');
    assert.equal(invalid.status, 400);
  });

  test('inactive categories are excluded from search and the public list (BR-4)', async () => {
    await ctx.as('admin1').put('/api/categories/plumbing', { active: false });
    const list = await ctx.as(null).get('/api/categories');
    assert.equal(list.body.data.length, 0);
    const search = await ctx.as(null).get('/api/providers?categoryId=plumbing&areaId=mirpur');
    assert.equal(search.body.data.items.length, 0);
  });

  test('provider profile update resolves service areas into postal codes', async () => {
    const res = await ctx.as('prov1').put('/api/providers/profile', { areaIds: ['mirpur', 'manchester-centre'], bio: 'Experienced plumber' });
    assert.equal(res.status, 200);
    assert.deepEqual(ctx.db.read('providers', 'prov1').postalCodes.sort(), ['M1 1AE', 'NW1 6XE']);
    const bad = await ctx.as('prov1').put('/api/providers/profile', { areaIds: ['nowhere'] });
    assert.equal(bad.status, 400);
  });

  test('public profile hides private contact details unless allowed', async () => {
    const res = await ctx.as(null).get('/api/providers/prov1');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.provider.phone, '');
    assert.equal(res.body.data.provider.isVerified, true);
    assert.equal(res.body.data.services.length, 1);
  });
});
