import '../helpers/env.js';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { rangesOverlap, setClock } from '../../src/utils/time.js';
import { evaluateSlot, generateSlots, findConflict } from '../../src/utils/scheduling.js';
import { evaluateCancellation } from '../../src/services/booking.policy.js';
import { WEEKDAYS, DEFAULT_SETTINGS } from '../../src/constants/index.js';

const availability = {
  weekly: Object.fromEntries(WEEKDAYS.map((d) => [d, { enabled: d !== 'sunday', start: '09:00', end: '17:00' }])),
  exceptions: [{ date: '2030-01-09', reason: 'Family event' }],
};
const base = { availability, today: '2030-01-07', nowMinutes: 8 * 60, existingBookings: [] };

describe('time overlap', () => {
  test('detects overlapping ranges', () => {
    assert.equal(rangesOverlap('10:00', '11:00', '10:30', '11:30'), true);
    assert.equal(rangesOverlap('10:00', '11:00', '09:00', '12:00'), true);
  });
  test('back-to-back ranges do not overlap', () => {
    assert.equal(rangesOverlap('10:00', '11:00', '11:00', '12:00'), false);
    assert.equal(rangesOverlap('10:00', '11:00', '09:00', '10:00'), false);
  });
});

describe('slot evaluation', () => {
  test('accepts a free slot inside working hours', () => {
    const result = evaluateSlot({ ...base, date: '2030-01-08', startTime: '10:00', duration: 60 });
    assert.deepEqual(result, { ok: true, endTime: '11:00' });
  });

  test('rejects slots outside working hours', () => {
    assert.equal(evaluateSlot({ ...base, date: '2030-01-08', startTime: '16:30', duration: 60 }).code, 'OUTSIDE_HOURS');
    assert.equal(evaluateSlot({ ...base, date: '2030-01-08', startTime: '08:00', duration: 60 }).code, 'OUTSIDE_HOURS');
  });

  test('rejects days off and exception dates', () => {
    assert.equal(evaluateSlot({ ...base, date: '2030-01-13', startTime: '10:00', duration: 60 }).code, 'DAY_UNAVAILABLE'); // Sunday
    assert.equal(evaluateSlot({ ...base, date: '2030-01-09', startTime: '10:00', duration: 60 }).code, 'DAY_UNAVAILABLE');
  });

  test('rejects past dates and insufficient notice', () => {
    assert.equal(evaluateSlot({ ...base, date: '2030-01-06', startTime: '10:00', duration: 60 }).code, 'PAST_DATE');
    assert.equal(evaluateSlot({ ...base, nowMinutes: 8 * 60 + 30, date: '2030-01-07', startTime: '09:00', duration: 60 }).code, 'TOO_SOON');
  });

  test('rejects overlapping active bookings but ignores cancelled ones', () => {
    const existing = [
      { id: 'b1', startTime: '10:00', endTime: '11:00', status: 'confirmed' },
      { id: 'b2', startTime: '13:00', endTime: '14:00', status: 'cancelled' },
    ];
    assert.equal(evaluateSlot({ ...base, existingBookings: existing, date: '2030-01-08', startTime: '10:30', duration: 60 }).code, 'CONFLICT');
    assert.equal(evaluateSlot({ ...base, existingBookings: existing, date: '2030-01-08', startTime: '13:00', duration: 60 }).ok, true);
    assert.equal(findConflict(existing, '11:00', '12:00'), null);
  });

  test('generateSlots excludes taken times', () => {
    const existing = [{ id: 'b1', startTime: '10:00', endTime: '11:00', status: 'pending' }];
    const { slots } = generateSlots({ ...base, existingBookings: existing, date: '2030-01-08', duration: 60, intervalMinutes: 60 });
    const starts = slots.map((s) => s.startTime);
    assert.ok(!starts.includes('10:00'));
    assert.ok(starts.includes('09:00') && starts.includes('11:00') && starts.includes('16:00'));
    assert.ok(!starts.includes('17:00'));
  });
});

describe('cancellation policy', () => {
  const booking = { bookingDate: '2030-01-08', startTime: '10:00', status: 'confirmed', price: 2000 };

  test('free before the configured cutoff', () => {
    setClock('2030-01-07T03:00:00.000Z'); // 25h before
    const decision = evaluateCancellation(booking, DEFAULT_SETTINGS);
    assert.equal(decision.canCancel, true);
    assert.equal(decision.isLate, false);
  });

  test('late inside the cutoff, with fee when configured', () => {
    setClock('2030-01-08T09:00:00.000Z'); // 09:00 GMT → 60 minutes before
    const warn = evaluateCancellation(booking, DEFAULT_SETTINGS);
    assert.equal(warn.isLate, true);
    assert.equal(warn.canCancel, true);
    const fee = evaluateCancellation(booking, { ...DEFAULT_SETTINGS, lateCancellationPolicy: 'fee', lateCancellationFeePercent: 25 });
    assert.equal(fee.fee, 500);
    const block = evaluateCancellation(booking, { ...DEFAULT_SETTINGS, lateCancellationPolicy: 'block' });
    assert.equal(block.canCancel, false);
  });

  test('cutoff is configurable', () => {
    setClock('2030-01-08T04:00:00.000Z');
    const decision = evaluateCancellation(booking, { ...DEFAULT_SETTINGS, bookingCancellationCutoffMinutes: 30 });
    assert.equal(decision.isLate, false);
    setClock(null);
  });
});
