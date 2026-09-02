import type { BaseEntity, HabitFrequency } from '@putter/core';

/**
 * A habit and its full completion log. Deliberately just an array of
 * date-only strings — "how often" (frequency) and "did you actually do
 * it" (completions) are kept as separate concerns, with all the derived
 * math (streaks) computed on read via the shared engine in
 * `@putter/core`, not cached/stored fields that could drift out of sync
 * with the raw log.
 */
export interface Habit extends BaseEntity {
  frequency: HabitFrequency;
  /** Date-only ISO strings ("2026-09-01"), unique, order not guaranteed. */
  completions: string[];
}
