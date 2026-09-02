import { toolRegistry } from '@putter/core';
import type { ToolManifest } from '@putter/core';
import TaskManagerToday from './TaskManagerToday';
import TaskManagerView from './TaskManagerView';
import './db'; // ensures the schema is registered even if nothing else imports it first

export const tasksManifest: ToolManifest = {
  id: 'tasks',
  displayName: 'Tasks',
  category: 'plan',
  TodayWidget: TaskManagerToday,
  FullView: TaskManagerView,
};

/**
 * Registers Task Manager with the shared registry — called once from the
 * app shell's entry point, before the first render, so the registry is
 * non-empty by the time <TodayView> and the nav render (see M0's manifest
 * pattern in packages/core/src/manifest.ts).
 */
export function registerTasksTool(): void {
  toolRegistry.register(tasksManifest);
}
