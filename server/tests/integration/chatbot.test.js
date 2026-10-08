import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';
import { setAiProvider } from '../../src/chatbot/providers/aiProvider.js';

describe('15. chatbot authentication & privacy', () => {
  let ctx;
  beforeEach(async () => {
    ctx = createTestContext();
    ctx.seedMarketplace();
    ctx.seedService('svc-secret', 'prov1', { title: 'Secret service' });
    // cust2 has a private booking that cust1 must never see.
    const res = await ctx.as('cust2').post('/api/bookings', ctx.bookingBody({ serviceId: 'svc-secret', startTime: '15:00' }));
    assert.equal(res.status, 201);
  });

  test('guests get FAQ answers', async () => {
    const res = await ctx.as(null).post('/api/chatbot/message', { message: 'How do I register?' });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.source, 'faq');
    assert.match(res.body.data.reply, /Sign up/);
  });

  test('guests asking for account data are told to sign in', async () => {
    const res = await ctx.as(null).post('/api/chatbot/message', { message: 'What is my booking status?' });
    assert.match(res.body.data.reply, /sign in/i);
    assert.doesNotMatch(res.body.data.reply, /Secret service/);
  });

  test('a customer only ever sees their own bookings', async () => {
    const empty = await ctx.as('cust1').post('/api/chatbot/message', { message: 'What is my booking status?' });
    assert.equal(empty.body.data.source, 'account');
    assert.match(empty.body.data.reply, /no bookings/i);
    assert.doesNotMatch(empty.body.data.reply, /Secret service/);

    const own = await ctx.as('cust2').post('/api/chatbot/message', { message: 'What is my booking status?' });
    assert.match(own.body.data.reply, /Secret service/);
  });

  test('a userId in the request body is rejected, not trusted', async () => {
    const res = await ctx.as('cust1').post('/api/chatbot/message', { message: 'What is my booking status?', userId: 'cust2' });
    assert.equal(res.status, 400);
  });

  test('providers get their own earnings; customers cannot trigger provider/admin intents', async () => {
    const provider = await ctx.as('prov1').post('/api/chatbot/message', { message: 'What are my earnings?' });
    assert.equal(provider.body.data.source, 'account');
    assert.match(provider.body.data.reply, /PKR/);

    const customer = await ctx.as('cust1').post('/api/chatbot/message', { message: 'How many pending providers?' });
    assert.notEqual(customer.body.data.source, 'account');

    const admin = await ctx.as('admin1').post('/api/chatbot/message', { message: 'How many pending providers?' });
    assert.equal(admin.body.data.source, 'account');
    assert.match(admin.body.data.reply, /0 provider/);
  });

  test('unanswerable questions fall back to support and are logged as unresolved', async () => {
    const res = await ctx.as('cust1').post('/api/chatbot/message', { message: 'Quantum chromodynamics lattice?' });
    assert.equal(res.body.data.resolved, false);
    assert.match(res.body.data.reply, /couldn't fully resolve/);
    assert.match(res.body.data.reply, /support/);
    const logged = ctx.db.all('chatbotQueries').find((q) => q.question.startsWith('Quantum'));
    assert.equal(logged.resolved, false);
    assert.equal(logged.userId, 'cust1');

    const adminList = await ctx.as('admin1').get('/api/admin/chatbot-queries?resolved=false');
    assert.ok(adminList.body.data.some((q) => q.id === logged.id));
    assert.equal((await ctx.as('cust1').get('/api/admin/chatbot-queries')).status, 403);
  });

  test('AI provider is used when configured and its context only holds the caller\'s data', async () => {
    let captured = null;
    setAiProvider({
      name: 'stub',
      isAvailable: () => true,
      generate: async ({ system }) => {
        captured = system;
        return 'Here is an AI answer.';
      },
    });
    const res = await ctx.as('cust1').post('/api/chatbot/message', { message: 'Tell me something about water pressure tanks' });
    assert.equal(res.body.data.source, 'ai');
    assert.doesNotMatch(captured, /Secret service/);
  });

  test('history returns only the caller\'s conversations', async () => {
    await ctx.as('cust1').post('/api/chatbot/message', { message: 'How do I book?' });
    await ctx.as('cust2').post('/api/chatbot/message', { message: 'How do I cancel?' });
    const history = await ctx.as('cust1').get('/api/chatbot/history');
    assert.equal(history.status, 200);
    assert.deepEqual(history.body.data.map((h) => h.question), ['How do I book?']);
    assert.equal((await ctx.as(null).get('/api/chatbot/history')).status, 401);
  });
});
