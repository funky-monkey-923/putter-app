import type { Table } from 'dexie';
import { db, DexieRepository, computeCurrentStreak, computeLongestStreak } from '@putter/core';
import './db'; // side effect: registers the habits schema (version 3)
import type { Habit } from './types';

export class HabitRepository extends DexieRepository<Habit> {
  constructor() {
    super(db.table('habits') as Table<Habit, string>);
  }

  /**
   * Toggles a single day on/off — a habit tracker's actual "did you do
   * it" interaction is marking any day complete/incomplete directly (on
   * today or on a past day, to correct a missed entry), not a one-way
   * "complete" action like Task Manager's. This is also what makes
   * "completing early/late" a non-issue: there's no separate due date to
   * be early or late against, just a log of which days happened.
   */
  async toggleCompletion(habitId: string, dateIso: string): Promise<Habit> {
    const habit = await this.getById(habitId);
    if (!habit) {
      throw new Error(`HabitRepository.toggleCompletion: habit ${habitId} not found`);
    }
    const completions = habit.completions.includes(dateIso)
      ? habit.completions.filter((d) => d !== dateIso)
      : [...habit.completions, dateIso];
    return this.update(habitId, { completions });
  }

  /** Current streak as of today — thin wrapper around the shared engine, kept here so callers don't need to import computeCurrentStreak themselves. */
  getCurrentStreak(habit: Habit, todayIso: string): number {
    return computeCurrentStreak(habit.frequency, habit.completions, todayIso);
  }

  getLongestStreak(habit: Habit): number {
    return computeLongestStreak(habit.frequency, habit.completions);
  }
}
