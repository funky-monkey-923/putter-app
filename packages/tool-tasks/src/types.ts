import type { BaseEntity } from '@putter/core';
import type { RecurrenceRule } from '@putter/core';

export type TaskStatus = 'todo' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

/**
 * The Task Manager's core entity. Deliberately narrow for v1, per the
 * Build Roadmap's M1 scope: due dates, priority, tags (inherited from
 * BaseEntity), subtasks, one project/list grouping, and recurrence. No
 * natural-language date parsing or Kanban board — both real T2/T3 features
 * from the Master Feature List, not v1.
 */
export interface Task extends BaseEntity {
  status: TaskStatus;
  /** Date-only string ("2026-09-01"), not a full timestamp — a task is due on a day, not at a specific instant. */
  dueDate: string | null;
  priority: TaskPriority;
  projectId: string | null;
  subtasks: Subtask[];
  /** null means this task doesn't recur — a normal one-off task. */
  recurrence: RecurrenceRule | null;
  completedAt: string | null;
  /**
   * Total minutes logged against this task via linked Focus Timer
   * sessions (M2) — incremented by `logTime()`, never set directly.
   * Deliberately just a running total, not a log of individual sessions;
   * Focus Timer's own session history is the place to see the breakdown.
   */
  loggedMinutes: number;
}

/**
 * A simple named grouping for tasks — deliberately just a title, not a
 * full project-management concept (no owners, no due dates on the project
 * itself). "Projects/lists as a simple grouping mechanism" per the roadmap.
 */
export interface Project extends BaseEntity {
  color: string | null;
}
