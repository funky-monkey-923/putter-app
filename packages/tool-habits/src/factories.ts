import type { HabitFrequency } from '@putter/core';
import type { Habit } from './types';

/** Builds a new Habit with zero completions — used by the "new habit" form and by tests. */
export function makeHabit(input: { title: string; frequency: HabitFrequency; tags?: string[] }): Habit {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type: 'habit',
    title: input.title,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    tags: input.tags ?? [],
    links: [],
    frequency: input.frequency,
    completions: [],
  };
}
