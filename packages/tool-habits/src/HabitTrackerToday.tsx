import { useEffect, useState } from 'react';
import { HabitRepository } from './habit-repository';
import type { Habit } from './types';

const repo = new HabitRepository();

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The Today-view widget: every habit, a quick toggle for today, and the
 * current streak — deliberately no frequency editing or calendar heatmap
 * here, both live in the full view (same Today-vs-FullView split as
 * Tasks and Focus Timer).
 */
function HabitTrackerToday() {
  const [habits, setHabits] = useState<Habit[]>([]);

  async function refresh() {
    setHabits(await repo.getAll());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleToggle(habitId: string) {
    await repo.toggleCompletion(habitId, todayIso());
    await refresh();
  }

  if (habits.length === 0) {
    return <p className="text-ink-soft text-sm">No habits yet — add one in the full Habits view.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {habits.map((habit) => {
        const doneToday = habit.completions.includes(todayIso());
        const streak = repo.getCurrentStreak(habit, todayIso());
        return (
          <li key={habit.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={doneToday}
              onChange={() => handleToggle(habit.id)}
              aria-label={`Mark ${habit.title} done today`}
            />
            <span className="text-ink">{habit.title}</span>
            {streak > 0 && <span className="text-xs font-mono text-sage">🔥 {streak}</span>}
          </li>
        );
      })}
    </ul>
  );
}

export default HabitTrackerToday;
