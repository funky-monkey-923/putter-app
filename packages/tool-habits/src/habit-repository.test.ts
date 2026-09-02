import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@putter/core';
import { HabitRepository } from './habit-repository';
import { makeHabit } from './factories';

describe('HabitRepository', () => {
  let habits: HabitRepository;

  beforeEach(async () => {
    habits = new HabitRepository();
    await db.table('habits').clear();
  });

  it('creates a habit with zero completions via makeHabit()', async () => {
    const habit = makeHabit({ title: 'Drink water', frequency: { type: 'daily' } });
    await habits.create(habit);

    const found = await habits.getById(habit.id);
    expect(found?.completions).toEqual([]);
  });

  it('toggleCompletion() marks a day complete, then toggling again undoes it', async () => {
    const habit = makeHabit({ title: 'Stretch', frequency: { type: 'daily' } });
    await habits.create(habit);

    const marked = await habits.toggleCompletion(habit.id, '2026-01-01');
    expect(marked.completions).toEqual(['2026-01-01']);

    const unmarked = await habits.toggleCompletion(habit.id, '2026-01-01');
    expect(unmarked.completions).toEqual([]);
  });

  it('toggleCompletion() can mark a past day, not just today — correcting a missed entry', async () => {
    const habit = makeHabit({ title: 'Journal', frequency: { type: 'daily' } });
    await habits.create(habit);

    await habits.toggleCompletion(habit.id, '2026-01-01');
    const updated = await habits.toggleCompletion(habit.id, '2025-12-25');

    expect(updated.completions.sort()).toEqual(['2025-12-25', '2026-01-01']);
  });

  it('getCurrentStreak()/getLongestStreak() delegate to the shared streak engine correctly', async () => {
    const habit = makeHabit({ title: 'Read', frequency: { type: 'daily' } });
    await habits.create(habit);
    await habits.toggleCompletion(habit.id, '2026-01-01');
    await habits.toggleCompletion(habit.id, '2026-01-02');
    const updated = await habits.toggleCompletion(habit.id, '2026-01-03');

    expect(habits.getCurrentStreak(updated, '2026-01-03')).toBe(3);
    expect(habits.getLongestStreak(updated)).toBe(3);
  });
});
