import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { HabitFrequency } from '@putter/core';
import { HabitRepository } from './habit-repository';
import { makeHabit } from './factories';
import type { Habit } from './types';

const repo = new HabitRepository();
const HEATMAP_DAYS = 84; // 12 weeks — enough to see a real pattern without the grid getting unwieldy

type FrequencyType = HabitFrequency['type'];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date(`${todayIso()}T00:00:00.000Z`);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/**
 * The full page: create habits (with a real frequency choice, not just
 * daily), see every habit's current + longest streak, a visual calendar
 * heatmap of the last 12 weeks, and toggle any day directly on the
 * heatmap (not just today) — this is where "completing early/late"
 * actually gets corrected, per this tool's whole design (see
 * HabitRepository.toggleCompletion's doc comment).
 */
function HabitTrackerView() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [everyNDays, setEveryNDays] = useState(3);

  async function refresh() {
    setHabits(await repo.getAll());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAddHabit(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let frequency: HabitFrequency;
    if (frequencyType === 'timesPerWeek') {
      frequency = { type: 'timesPerWeek', count: timesPerWeek };
    } else if (frequencyType === 'everyNDays') {
      frequency = { type: 'everyNDays', days: everyNDays };
    } else {
      frequency = { type: 'daily' };
    }

    await repo.create(makeHabit({ title: newTitle.trim(), frequency }));
    setNewTitle('');
    await refresh();
  }

  async function handleToggleDay(habitId: string, dateIso: string) {
    await repo.toggleCompletion(habitId, dateIso);
    await refresh();
  }

  async function handleDelete(habitId: string) {
    await repo.delete(habitId);
    await refresh();
  }

  function frequencyLabel(frequency: HabitFrequency): string {
    if (frequency.type === 'daily') return 'Every day';
    if (frequency.type === 'timesPerWeek') return `${frequency.count}x per week`;
    return `Every ${frequency.days} days`;
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="font-display text-xl text-ink mb-2">Add a habit</h2>
        <form onSubmit={handleAddHabit} className="flex flex-wrap gap-2 items-end">
          <input
            className="border border-taupe rounded px-2 py-1 text-sm"
            placeholder="Habit title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <select
            className="border border-taupe rounded px-2 py-1 text-sm"
            value={frequencyType}
            onChange={(e) => setFrequencyType(e.target.value as FrequencyType)}
          >
            <option value="daily">Every day</option>
            <option value="timesPerWeek">X times per week</option>
            <option value="everyNDays">Every N days</option>
          </select>
          {frequencyType === 'timesPerWeek' && (
            <input
              type="number"
              min={1}
              max={7}
              value={timesPerWeek}
              onChange={(e) => setTimesPerWeek(Math.max(1, Number(e.target.value) || 1))}
              className="border border-taupe rounded px-2 py-1 text-sm w-16"
              aria-label="Times per week"
            />
          )}
          {frequencyType === 'everyNDays' && (
            <input
              type="number"
              min={2}
              max={30}
              value={everyNDays}
              onChange={(e) => setEveryNDays(Math.max(2, Number(e.target.value) || 2))}
              className="border border-taupe rounded px-2 py-1 text-sm w-16"
              aria-label="Every N days"
            />
          )}
          <button type="submit" className="bg-sage text-white rounded px-3 py-1 text-sm">
            Add
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Habits</h2>
        {habits.length === 0 ? (
          <p className="text-ink-soft text-sm">No habits yet — add one above.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                frequencyLabel={frequencyLabel(habit.frequency)}
                onToggleDay={(dateIso) => handleToggleDay(habit.id, dateIso)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function HabitCard({
  habit,
  frequencyLabel,
  onToggleDay,
  onDelete,
}: {
  habit: Habit;
  frequencyLabel: string;
  onToggleDay: (dateIso: string) => void;
  onDelete: () => void;
}) {
  const currentStreak = repo.getCurrentStreak(habit, todayIso());
  const longestStreak = repo.getLongestStreak(habit);
  const days = lastNDays(HEATMAP_DAYS);
  const completedSet = new Set(habit.completions);

  return (
    <li className="rounded-lg border border-taupe bg-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-ink font-display">{habit.title}</span>
        <span className="text-xs font-mono text-lavender">{frequencyLabel}</span>
        {currentStreak > 0 && <span className="text-xs font-mono text-sage">🔥 {currentStreak}</span>}
        <span className="text-xs font-mono text-ink-soft">best: {longestStreak}</span>
        <button onClick={onDelete} className="ml-auto text-xs text-ink-soft underline">
          Delete
        </button>
      </div>

      <div className="flex flex-wrap gap-0.5" role="group" aria-label={`${habit.title} completion history`}>
        {days.map((dateIso) => {
          const done = completedSet.has(dateIso);
          return (
            <button
              key={dateIso}
              onClick={() => onToggleDay(dateIso)}
              title={`${dateIso}${done ? ' — done' : ''}`}
              aria-label={`${dateIso}${done ? ', completed' : ', not completed'}`}
              className={`w-3 h-3 rounded-sm ${done ? 'bg-sage' : 'bg-taupe'}`}
            />
          );
        })}
      </div>
    </li>
  );
}

export default HabitTrackerView;
