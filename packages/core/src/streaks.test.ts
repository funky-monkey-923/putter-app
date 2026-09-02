import { describe, expect, it } from 'vitest';
import { computeCurrentStreak, computeLongestStreak, type HabitFrequency } from './streaks';

describe('computeCurrentStreak — daily', () => {
  const daily: HabitFrequency = { type: 'daily' };

  it('counts consecutive days ending today', () => {
    const completions = ['2026-01-01', '2026-01-02', '2026-01-03'];
    expect(computeCurrentStreak(daily, completions, '2026-01-03')).toBe(3);
  });

  it("grants a grace period for today not yet done — streak stays alive off yesterday's completion", () => {
    const completions = ['2026-01-01', '2026-01-02', '2026-01-03'];
    // Today is 01-04, not yet completed — streak should still read 3, not 0.
    expect(computeCurrentStreak(daily, completions, '2026-01-04')).toBe(3);
  });

  it('breaks the streak on a genuinely missed day, not just "not done yet"', () => {
    const completions = ['2026-01-01', '2026-01-02']; // missed 01-03 entirely
    // Today is 01-04 — 01-03 is a fully-elapsed missed day, so the streak is broken.
    expect(computeCurrentStreak(daily, completions, '2026-01-04')).toBe(0);
  });

  it('returns 0 for a habit with no completions at all', () => {
    expect(computeCurrentStreak(daily, [], '2026-01-04')).toBe(0);
  });

  it('handles a completion logged for today itself, streak of 1', () => {
    expect(computeCurrentStreak(daily, ['2026-01-04'], '2026-01-04')).toBe(1);
  });

  it('correctly crosses a month boundary', () => {
    const completions = ['2026-01-30', '2026-01-31', '2026-02-01'];
    expect(computeCurrentStreak(daily, completions, '2026-02-01')).toBe(3);
  });
});

describe('computeCurrentStreak — everyNDays', () => {
  const everyThree: HabitFrequency = { type: 'everyNDays', days: 3 };

  it('counts a streak where each completion lands within the allowed window of the last', () => {
    // Gaps of exactly 3 days each — right at the edge of allowed, not over it.
    const completions = ['2026-01-01', '2026-01-04', '2026-01-07'];
    expect(computeCurrentStreak(everyThree, completions, '2026-01-07')).toBe(3);
  });

  it('breaks the streak when a gap between completions exceeds the window', () => {
    const completions = ['2026-01-01', '2026-01-08']; // 7-day gap, window is 3
    expect(computeCurrentStreak(everyThree, completions, '2026-01-08')).toBe(1);
  });

  it('returns 0 if the most recent completion is already older than the window allows', () => {
    const completions = ['2026-01-01'];
    // Today is 10 days later — well past the 3-day window.
    expect(computeCurrentStreak(everyThree, completions, '2026-01-11')).toBe(0);
  });

  it('completing early (before the window closes) does not break or inflate the streak incorrectly', () => {
    const completions = ['2026-01-01', '2026-01-02']; // completed a day early, 1-day gap (well within 3)
    expect(computeCurrentStreak(everyThree, completions, '2026-01-02')).toBe(2);
  });
});

describe('computeCurrentStreak — timesPerWeek', () => {
  const threePerWeek: HabitFrequency = { type: 'timesPerWeek', count: 3 };

  it('counts a full week that met the threshold', () => {
    // 2026-01-05 is a Monday — a full ISO week of 3+ completions.
    const completions = ['2026-01-05', '2026-01-07', '2026-01-09'];
    expect(computeCurrentStreak(threePerWeek, completions, '2026-01-11')).toBe(1);
  });

  it('does not break the streak for the current, still-in-progress week even if under threshold so far', () => {
    const lastWeekMet = ['2026-01-05', '2026-01-07', '2026-01-09']; // met, week of Jan 5
    const thisWeekPartial = ['2026-01-12']; // only 1 so far this week — not yet met, but week isn't over
    const completions = [...lastWeekMet, ...thisWeekPartial];
    // Today is Jan 13 (Tuesday of the new week) — the in-progress week shouldn't zero out last week's streak.
    expect(computeCurrentStreak(threePerWeek, completions, '2026-01-13')).toBe(1);
  });

  it('breaks the streak on a fully-elapsed week that missed the threshold', () => {
    const twoWeeksAgoMet = ['2025-12-29', '2025-12-31', '2026-01-02']; // met
    const lastWeekMissed = ['2026-01-05']; // only 1, threshold is 3, and this week is now fully over
    const completions = [...twoWeeksAgoMet, ...lastWeekMissed];
    expect(computeCurrentStreak(threePerWeek, completions, '2026-01-13')).toBe(0);
  });
});

describe('computeLongestStreak', () => {
  it('finds the longest run even if the current streak is shorter or broken', () => {
    const daily: HabitFrequency = { type: 'daily' };
    // A 4-day streak in the middle, then a gap, then a shorter 1-day streak.
    const completions = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-10'];
    expect(computeLongestStreak(daily, completions)).toBe(4);
  });

  it('returns 0 for no completions', () => {
    expect(computeLongestStreak({ type: 'daily' }, [])).toBe(0);
  });
});
