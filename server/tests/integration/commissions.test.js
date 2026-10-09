import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '../helpers/context.js';

describe('commission & payment verification system', () => {
  let ctx;
  beforeEach(() => {
    ctx = createTestContext();
    ctx.seedMarketplace();
    ctx.seedService('svcHundred', 'prov1', { price: 100, title: 'Full plumbing service' });
  });

  async function createCompletedBooking() {
    const created = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ serviceId: 'svcHundred', startTime: '10:00' }));
    const id = created.body.data.id;
    await ctx.as('prov1').patch(`/api/bookings/${id}/status`, { status: 'confirmed' });
    ctx.setClock('2030-01-08T10:00:00.000Z');
    await ctx.as('prov1').patch(`/api/bookings/${id}/status`, { status: 'completed' });
    return id;
  }

  test('dual payment confirmation auto-creates an idempotent 10% commission', async () => {
    const id = await createCompletedBooking();

    const c1 = await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });
    assert.equal(c1.status, 200);
    assert.equal(c1.body.data.status, 'customer_confirmed');
    assert.equal(ctx.db.all('commissions').length, 0);

    const c2 = await ctx.as('prov1').patch(`/api/bookings/${id}/payment/provider-confirm`, { method: 'cash' });
    assert.equal(c2.status, 200);
    assert.equal(c2.body.data.status, 'paid');

    const commissions = ctx.db.all('commissions');
    assert.equal(commissions.length, 1);
    assert.equal(commissions[0].id, id);
    assert.equal(commissions[0].commissionAmountGBP, 10);
    assert.equal(commissions[0].providerEarningsGBP, 90);
    assert.equal(commissions[0].status, 'due');

    // Retrying an already-completed confirmation must never create a second commission.
    await ctx.as('prov1').patch(`/api/bookings/${id}/payment/provider-confirm`, { method: 'cash' });
    assert.equal(ctx.db.all('commissions').length, 1);

    const actions = ctx.db.all('auditLogs').map((l) => l.action);
    assert.ok(actions.includes('payment_customer_confirmed'));
    assert.ok(actions.includes('payment_provider_confirmed'));
    assert.ok(actions.includes('commission_created'));
  });

  test('a provider can never read or act on another provider\'s commission', async () => {
    const id = await createCompletedBooking();
    await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });
    await ctx.as('prov1').patch(`/api/bookings/${id}/payment/provider-confirm`, { method: 'cash' });

    ctx.seedProvider('prov2');
    const res = await ctx.as('prov2').get(`/api/commissions/my/${id}`);
    assert.equal(res.status, 404);
  });

  test('a customer cannot reach the commission endpoints at all', async () => {
    const id = await createCompletedBooking();
    const res = await ctx.as('cust1').get(`/api/commissions/my/${id}`);
    assert.equal(res.status, 403);
  });

  test('provider submits payment proof, admin verifies -> commission is paid; provider cannot self-verify', async () => {
    const id = await createCompletedBooking();
    await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });
    await ctx.as('prov1').patch(`/api/bookings/${id}/payment/provider-confirm`, { method: 'cash' });

    const submit = await ctx.as('prov1').post(`/api/commissions/my/${id}/submit-payment`, {
      method: 'bank_transfer',
      reference: 'TXN123',
      amountGBP: 10,
    });
    assert.equal(submit.status, 200);
    assert.equal(submit.body.data.status, 'under_review');

    const selfVerify = await ctx.as('prov1').post(`/api/admin/commissions/${id}/verify`, {});
    assert.equal(selfVerify.status, 403);

    const verify = await ctx.as('admin1').post(`/api/admin/commissions/${id}/verify`, { note: 'Bank statement checked' });
    assert.equal(verify.status, 200);
    assert.equal(verify.body.data.status, 'paid');
    assert.equal(verify.body.data.paidAmountGBP, 10);

    const detail = await ctx.as('admin1').get(`/api/admin/commissions/${id}`);
    const timelineActions = detail.body.data.timeline.map((t) => t.action);
    assert.ok(timelineActions.includes('commission_payment_submitted'));
    assert.ok(timelineActions.includes('commission_verified'));
  });

  test('admin rejects a submission and the provider can resubmit', async () => {
    const id = await createCompletedBooking();
    await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });
    await ctx.as('prov1').patch(`/api/bookings/${id}/payment/provider-confirm`, { method: 'cash' });
    await ctx.as('prov1').post(`/api/commissions/my/${id}/submit-payment`, { method: 'cash', amountGBP: 10 });

    const rejected = await ctx.as('admin1').post(`/api/admin/commissions/${id}/reject`, { reason: 'No proof attached' });
    assert.equal(rejected.status, 200);
    assert.equal(rejected.body.data.status, 'rejected');

    const resubmit = await ctx.as('prov1').post(`/api/commissions/my/${id}/submit-payment`, { method: 'cash', amountGBP: 10 });
    assert.equal(resubmit.status, 200);
    assert.equal(resubmit.body.data.status, 'under_review');
  });

  test('admin records a partial payment, then settles the remainder', async () => {
    const id = await createCompletedBooking();
    await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });
    await ctx.as('prov1').patch(`/api/bookings/${id}/payment/provider-confirm`, { method: 'cash' });

    const partial = await ctx.as('admin1').post(`/api/admin/commissions/${id}/partial-payment`, { amountGBP: 4 });
    assert.equal(partial.status, 200);
    assert.equal(partial.body.data.status, 'partially_paid');
    assert.equal(partial.body.data.remainingAmountGBP, 6);

    const settled = await ctx.as('admin1').post(`/api/admin/commissions/${id}/partial-payment`, { amountGBP: 6 });
    assert.equal(settled.body.data.status, 'paid');
    assert.equal(settled.body.data.remainingAmountGBP, 0);
  });

  test('admin waives a commission', async () => {
    const id = await createCompletedBooking();
    await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });
    await ctx.as('prov1').patch(`/api/bookings/${id}/payment/provider-confirm`, { method: 'cash' });

    const waived = await ctx.as('admin1').post(`/api/admin/commissions/${id}/waive`, { reason: 'Goodwill gesture' });
    assert.equal(waived.status, 200);
    assert.equal(waived.body.data.status, 'waived');
    assert.equal(waived.body.data.remainingAmountGBP, 0);
  });

  test('a commission becomes overdue once past its due date and is filterable by admins', async () => {
    const id = await createCompletedBooking();
    await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });
    await ctx.as('prov1').patch(`/api/bookings/${id}/payment/provider-confirm`, { method: 'cash' });

    ctx.setClock('2030-01-20T10:00:00.000Z');
    const list = await ctx.as('admin1').get('/api/admin/commissions?status=overdue');
    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].id, id);
  });

  test('a payment dispute files a linked complaint and admin resolution triggers commission creation', async () => {
    const id = await createCompletedBooking();
    await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });

    const dispute = await ctx.as('prov1').post(`/api/bookings/${id}/payment/dispute`, { reason: 'Customer never actually paid me in cash' });
    assert.equal(dispute.status, 200);
    assert.equal(dispute.body.data.status, 'disputed');
    assert.equal(ctx.db.all('complaints').length, 1);
    assert.equal(ctx.db.all('complaints')[0].type, 'payment');

    const resolve = await ctx.as('admin1').post(`/api/admin/payments/${id}/resolve-dispute`, { resolution: 'paid', note: 'Confirmed via bank statement' });
    assert.equal(resolve.status, 200);
    assert.equal(resolve.body.data.status, 'paid');
    assert.equal(ctx.db.all('commissions').length, 1);
  });

  test('payment confirmation is rejected before the booking is completed', async () => {
    const created = await ctx.as('cust1').post('/api/bookings', ctx.bookingBody({ serviceId: 'svcHundred' }));
    const id = created.body.data.id;
    const res = await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });
    assert.equal(res.status, 400);
  });

  test('admin financial overview and audit log list reflect activity; non-admins are blocked', async () => {
    const id = await createCompletedBooking();
    await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });
    await ctx.as('prov1').patch(`/api/bookings/${id}/payment/provider-confirm`, { method: 'cash' });

    const overview = await ctx.as('admin1').get('/api/admin/financial-reports');
    assert.equal(overview.status, 200);
    assert.equal(overview.body.data.totals.totalCommissionGBP, 10);
    assert.equal(overview.body.data.totals.dueCount, 1);

    const logs = await ctx.as('admin1').get('/api/admin/audit-logs');
    assert.equal(logs.status, 200);
    assert.ok(logs.body.data.length >= 3);

    const unauthorized = await ctx.as('prov1').get('/api/admin/audit-logs');
    assert.equal(unauthorized.status, 403);
  });

  test('payment-settings: admin can change the commission rate and it applies to new commissions', async () => {
    const before = await ctx.as('admin1').get('/api/admin/payment-settings');
    assert.equal(before.body.data.commissionRatePercent, 10);

    const saved = await ctx.as('admin1').put('/api/admin/payment-settings', { commissionRatePercent: 15 });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.data.commissionRatePercent, 15);

    const id = await createCompletedBooking();
    await ctx.as('cust1').patch(`/api/bookings/${id}/payment/customer-confirm`, { method: 'cash' });
    await ctx.as('prov1').patch(`/api/bookings/${id}/payment/provider-confirm`, { method: 'cash' });

    const commission = ctx.db.all('commissions')[0];
    assert.equal(commission.commissionAmountGBP, 15);
  });

  test('a non-admin cannot update payment settings', async () => {
    const res = await ctx.as('prov1').put('/api/admin/payment-settings', { commissionRatePercent: 50 });
    assert.equal(res.status, 403);
  });
});
