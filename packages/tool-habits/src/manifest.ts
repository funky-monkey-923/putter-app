import { toolRegistry } from '@putter/core';
import type { ToolManifest } from '@putter/core';
import HabitTrackerToday from './HabitTrackerToday';
import HabitTrackerView from './HabitTrackerView';
import './db'; // ensures the schema is registered even if nothing else imports it first

export const habitsManifest: ToolManifest = {
  id: 'habits',
  displayName: 'Habits',
  category: 'rhythm',
  TodayWidget: HabitTrackerToday,
  FullView: HabitTrackerView,
};

/**
 * Registers Habit Tracker with the shared registry — called once from the
 * app shell's entry point, before the first render (see main.tsx).
 */
export function registerHabitsTool(): void {
  toolRegistry.register(habitsManifest);
}
