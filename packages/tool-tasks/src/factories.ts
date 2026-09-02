import type { Task, Project, TaskPriority } from './types';

/** Builds a new Task with sane defaults — used by the UI's "add task" form and by tests. */
export function makeTask(input: {
  title: string;
  dueDate?: string | null;
  priority?: TaskPriority;
  projectId?: string | null;
  recurrence?: Task['recurrence'];
  tags?: string[];
}): Task {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type: 'task',
    title: input.title,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    tags: input.tags ?? [],
    links: [],
    status: 'todo',
    dueDate: input.dueDate ?? null,
    priority: input.priority ?? 'medium',
    projectId: input.projectId ?? null,
    subtasks: [],
    recurrence: input.recurrence ?? null,
    completedAt: null,
    loggedMinutes: 0,
  };
}

/** Builds a new Project with sane defaults. */
export function makeProject(input: { title: string; color?: string | null }): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type: 'project',
    title: input.title,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    tags: [],
    links: [],
    color: input.color ?? null,
  };
}
