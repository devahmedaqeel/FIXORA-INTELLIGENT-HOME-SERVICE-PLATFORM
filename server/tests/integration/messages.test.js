import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';

describe('booking messages', () => {
  let ctx;
  let bookingId;

  beforeEach(async () => {
    ctx = createTestContext();
    ctx.seedMarketplace();
    const res = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody());
    bookingId = res.body.data.id;
  });

  test('customer and provider can exchange messages on their shared booking', async () => {
    const empty = await ctx.as('cust1').get(`/api/bookings/${bookingId}/messages`);
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body.data, []);

    const sent = await ctx.as('cust1').post(`/api/bookings/${bookingId}/messages`, { text: 'What time will you arrive?' });
    assert.equal(sent.status, 201);
    assert.equal(sent.body.data.senderId, 'cust1');
    assert.equal(sent.body.data.receiverId, 'prov1');
    assert.equal(sent.body.data.text, 'What time will you arrive?');
    assert.equal(sent.body.data.read, false);

    const providerView = await ctx.as('prov1').get(`/api/bookings/${bookingId}/messages`);
    assert.equal(providerView.status, 200);
    assert.equal(providerView.body.data.length, 1);
    assert.equal(providerView.body.data[0].text, 'What time will you arrive?');

    const reply = await ctx.as('prov1').post(`/api/bookings/${bookingId}/messages`, { text: 'I will be there at 10am.' });
    assert.equal(reply.status, 201);

    const thread = await ctx.as('cust1').get(`/api/bookings/${bookingId}/messages`);
    assert.equal(thread.body.data.length, 2);
    assert.equal(thread.body.data[1].text, 'I will be there at 10am.');
  });

  test('viewing the thread marks the other participant\'s messages as read', async () => {
    await ctx.as('cust1').post(`/api/bookings/${bookingId}/messages`, { text: 'Hello' });

    // The provider's own view call marks cust1's message read and reflects that immediately.
    const providerView = await ctx.as('prov1').get(`/api/bookings/${bookingId}/messages`);
    assert.equal(providerView.body.data[0].read, true);

    // The read flag persists for later fetches, including by the original sender.
    const senderView = await ctx.as('cust1').get(`/api/bookings/${bookingId}/messages`);
    assert.equal(senderView.body.data[0].read, true);
  });

  test('a stranger cannot view or send messages on someone else\'s booking', async () => {
    const view = await ctx.as('cust2').get(`/api/bookings/${bookingId}/messages`);
    assert.equal(view.status, 404);
    const send = await ctx.as('cust2').post(`/api/bookings/${bookingId}/messages`, { text: 'hi' });
    assert.equal(send.status, 404);
  });

  test('admin can view the thread but cannot send a message', async () => {
    await ctx.as('cust1').post(`/api/bookings/${bookingId}/messages`, { text: 'Hello' });
    const view = await ctx.as('admin1').get(`/api/bookings/${bookingId}/messages`);
    assert.equal(view.status, 200);
    assert.equal(view.body.data.length, 1);
    const send = await ctx.as('admin1').post(`/api/bookings/${bookingId}/messages`, { text: 'hi' });
    assert.equal(send.status, 403);
  });

  test('empty message text is rejected', async () => {
    const res = await ctx.as('cust1').post(`/api/bookings/${bookingId}/messages`, { text: '' });
    assert.equal(res.status, 400);
  });

  test('sending a message notifies the recipient', async () => {
    await ctx.as('cust1').post(`/api/bookings/${bookingId}/messages`, { text: 'Hello' });
    const notifications = await ctx.as('prov1').get('/api/notifications');
    const message = notifications.body.data.items.find((n) => n.type === 'new_message');
    assert.ok(message);
    assert.equal(message.category, 'booking');
  });
});
