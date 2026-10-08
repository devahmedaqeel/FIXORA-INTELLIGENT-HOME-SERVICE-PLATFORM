import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';

describe('customer saved addresses', () => {
  let ctx;
  beforeEach(() => {
    ctx = createTestContext();
    ctx.seedMarketplace();
  });

  const validAddress = (overrides = {}) => ({
    label: 'home',
    houseNumber: '12-B',
    street: 'Model Town Link Road',
    area: 'Model Town',
    city: 'Lahore',
    district: 'Lahore',
    province: 'Punjab',
    postalCode: '54700',
    ...overrides,
  });

  test('new customer has no addresses', async () => {
    const res = await ctx.as('cust1').get('/api/customers/addresses');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, []);
  });

  test('first address added becomes the default automatically', async () => {
    const res = await ctx.as('cust1').post('/api/customers/addresses', validAddress());
    assert.equal(res.status, 200);
    assert.equal(res.body.data.isDefault, true);
    assert.equal(res.body.data.city, 'Lahore');
    assert.ok(res.body.data.id);
  });

  test('second address is not default unless requested, and setting it default demotes the first', async () => {
    const first = await ctx.as('cust1').post('/api/customers/addresses', validAddress({ label: 'home' }));
    const second = await ctx.as('cust1').post('/api/customers/addresses', validAddress({ label: 'work', city: 'Karachi', isDefault: true }));
    assert.equal(second.status, 200);
    assert.equal(second.body.data.isDefault, true);

    const list = await ctx.as('cust1').get('/api/customers/addresses');
    const byId = Object.fromEntries(list.body.data.map((a) => [a.id, a]));
    assert.equal(byId[first.body.data.id].isDefault, false);
    assert.equal(byId[second.body.data.id].isDefault, true);
  });

  test('updating an address can change its fields and promote it to default', async () => {
    const first = await ctx.as('cust1').post('/api/customers/addresses', validAddress());
    const second = await ctx.as('cust1').post('/api/customers/addresses', validAddress({ city: 'Karachi' }));

    const updated = await ctx.as('cust1').put(`/api/customers/addresses/${second.body.data.id}`, { city: 'Multan', isDefault: true });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.city, 'Multan');
    assert.equal(updated.body.data.isDefault, true);

    const list = await ctx.as('cust1').get('/api/customers/addresses');
    const first_ = list.body.data.find((a) => a.id === first.body.data.id);
    assert.equal(first_.isDefault, false);
  });

  test('deleting the default address promotes another remaining address to default', async () => {
    const first = await ctx.as('cust1').post('/api/customers/addresses', validAddress());
    const second = await ctx.as('cust1').post('/api/customers/addresses', validAddress({ city: 'Karachi' }));

    const del = await ctx.as('cust1').delete(`/api/customers/addresses/${first.body.data.id}`);
    assert.equal(del.status, 200);
    const remaining = del.body.data;
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, second.body.data.id);
    assert.equal(remaining[0].isDefault, true);
  });

  test('deleting the last address leaves an empty list with no error', async () => {
    const only = await ctx.as('cust1').post('/api/customers/addresses', validAddress());
    const del = await ctx.as('cust1').delete(`/api/customers/addresses/${only.body.data.id}`);
    assert.equal(del.status, 200);
    assert.deepEqual(del.body.data, []);
  });

  test('updating or deleting an address that does not exist returns 404', async () => {
    const updated = await ctx.as('cust1').put('/api/customers/addresses/missing-id', { city: 'Multan' });
    assert.equal(updated.status, 404);
    const deleted = await ctx.as('cust1').delete('/api/customers/addresses/missing-id');
    assert.equal(deleted.status, 404);
  });

  test('validation rejects a missing province and a malformed postal code', async () => {
    const res = await ctx.as('cust1').post('/api/customers/addresses', validAddress({ province: 'Narnia', postalCode: '123' }));
    assert.equal(res.status, 400);
    assert.ok(res.body.details.some((d) => d.field.includes('province')));
    assert.ok(res.body.details.some((d) => d.field.includes('postalCode')));
  });

  test('each customer only ever sees their own addresses', async () => {
    await ctx.as('cust1').post('/api/customers/addresses', validAddress());
    const other = await ctx.as('cust2').get('/api/customers/addresses');
    assert.deepEqual(other.body.data, []);
  });

  test('providers and admins cannot call customer address routes', async () => {
    assert.equal((await ctx.as('prov1').get('/api/customers/addresses')).status, 403);
    assert.equal((await ctx.as('admin1').get('/api/customers/addresses')).status, 403);
  });
});
