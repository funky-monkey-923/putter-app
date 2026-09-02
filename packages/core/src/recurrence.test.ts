import { describe, expect, it } from 'vitest';
import { computeNextDueDate, type RecurrenceRule } from './recurrence';

describe('computeNextDueDate', () => {
  it('daily: advances by the interval in days', () => {
    const rule: RecurrenceRule = { type: 'daily', interval: 1 };
    const next = computeNextDueDate(rule, '2026-01-01T00:00:00.000Z');
    expect(next).toBe('2026-01-02T00:00:00.000Z');
  });

  it('daily: supports a multi-day interval, not just every 1 day', () => {
    const rule: RecurrenceRule = { type: 'daily', interval: 3 };
    const next = computeNextDueDate(rule, '2026-01-01T00:00:00.000Z');
    expect(next).toBe('2026-01-04T00:00:00.000Z');
  });

  it('weekly: advances by interval * 7 days', () => {
    const rule: RecurrenceRule = { type: 'weekly', interval: 2 };
    const next = computeNextDueDate(rule, '2026-01-01T00:00:00.000Z');
    expect(next).toBe('2026-01-15T00:00:00.000Z');
  });

  it('custom-interval: advances by an arbitrary number of days', () => {
    const rule: RecurrenceRule = { type: 'custom-interval', days: 10 };
    const next = computeNextDueDate(rule, '2026-01-01T00:00:00.000Z');
    expect(next).toBe('2026-01-11T00:00:00.000Z');
  });

  it('is anchored to actual completion time, not the original due date — completing late does not stack up occurrences', () => {
    const rule: RecurrenceRule = { type: 'daily', interval: 1 };
    // Originally due 2026-01-01, but actually completed three days late.
    const completedLate = '2026-01-04T00:00:00.000Z';
    const next = computeNextDueDate(rule, completedLate);
    // Next occurrence is one day after the LATE completion, not a backlog
    // of three missed daily occurrences.
    expect(next).toBe('2026-01-05T00:00:00.000Z');
  });

  it('correctly crosses a month boundary', () => {
    const rule: RecurrenceRule = { type: 'daily', interval: 1 };
    const next = computeNextDueDate(rule, '2026-01-31T00:00:00.000Z');
    expect(next).toBe('2026-02-01T00:00:00.000Z');
  });

  it('correctly crosses a year boundary', () => {
    const rule: RecurrenceRule = { type: 'daily', interval: 1 };
    const next = computeNextDueDate(rule, '2026-12-31T00:00:00.000Z');
    expect(next).toBe('2027-01-01T00:00:00.000Z');
  });

  it('correctly handles a leap-day crossing (2028 is a leap year)', () => {
    const rule: RecurrenceRule = { type: 'daily', interval: 1 };
    const next = computeNextDueDate(rule, '2028-02-28T00:00:00.000Z');
    expect(next).toBe('2028-02-29T00:00:00.000Z');
  });
});
