import type { BaseEntity } from '@putter/core';

/**
 * A single focus/Pomodoro session. Deliberately a plain `taskId` field
 * (indexed, queryable) rather than BaseEntity's generic `links` array —
 * this relationship is the tool's core feature and needs to be queried
 * directly, not treated as one of several arbitrary freeform links.
 *
 * `taskTitle` is a deliberate denormalized snapshot of the linked task's
 * title at the moment the session started — so session history can
 * render a task name without a cross-tool lookup (Focus Timer doesn't
 * import Task Manager's code, so it can't just ask for the current title
 * later, and the task could theoretically be deleted by then anyway).
 */
export interface FocusSession extends BaseEntity {
  taskId: string | null;
  taskTitle: string | null;
  plannedMinutes: number;
  /** null while the session is still running. */
  actualMinutes: number | null;
  startedAt: string;
  /** null while the session is still running. */
  completedAt: string | null;
}
