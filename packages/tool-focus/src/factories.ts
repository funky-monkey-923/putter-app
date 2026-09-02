import type { FocusSession } from './types';

/** Builds a new, in-progress FocusSession — used when starting a timer and by tests. */
export function makeFocusSession(input: {
  plannedMinutes: number;
  taskId?: string | null;
  taskTitle?: string | null;
}): FocusSession {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type: 'focusSession',
    title: `Focus session (${input.plannedMinutes}m)`,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    tags: [],
    links: [],
    taskId: input.taskId ?? null,
    taskTitle: input.taskTitle ?? null,
    plannedMinutes: input.plannedMinutes,
    actualMinutes: null,
    startedAt: now,
    completedAt: null,
  };
}
