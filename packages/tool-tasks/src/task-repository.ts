import type { Table } from 'dexie';
import { db, DexieRepository } from '@putter/core';
import { computeNextDueDate } from '@putter/core';
import './db'; // side effect: registers the tasks/projects schema (version 1)
import type { Task, Subtask } from './types';

export class TaskRepository extends DexieRepository<Task> {
  constructor() {
    super(db.table('tasks') as Table<Task, string>);
  }

  /**
   * Domain-specific completion logic — this is the answer to the Build
   * Roadmap's own validation-gate question ("what happens to a recurring
   * task after you complete it?"): a non-recurring task just gets marked
   * done; a recurring task instead resets to 'todo' with its dueDate
   * advanced via the shared recurrence engine (see core/recurrence.ts),
   * so completing it doesn't create a growing pile of duplicate task rows.
   *
   * Note on dates: `dueDate` is a date-only string ("2026-09-01"), not a
   * full timestamp — a task is due on a day, not at a specific instant.
   * `completeTask` slices the recurrence engine's full ISO timestamp back
   * down to date-only so `getDueTodayOrOverdue`'s string comparison stays
   * correct (a full ISO timestamp string is NOT safely comparable against
   * a date-only string with simple `<=`).
   */
  async completeTask(id: string): Promise<Task> {
    const task = await this.getById(id);
    if (!task) {
      throw new Error(`TaskRepository.completeTask: task ${id} not found`);
    }
    const completedAt = new Date().toISOString();

    if (task.recurrence) {
      const nextDueDate = computeNextDueDate(task.recurrence, completedAt).slice(0, 10);
      return this.update(id, {
        status: 'todo',
        completedAt,
        dueDate: nextDueDate,
      });
    }

    return this.update(id, { status: 'done', completedAt });
  }

  /** Reopens a completed (non-recurring) task — the undo action in the UI. */
  async reopenTask(id: string): Promise<Task> {
    return this.update(id, { status: 'todo', completedAt: null });
  }

  async addSubtask(taskId: string, title: string): Promise<Task> {
    const task = await this.getById(taskId);
    if (!task) {
      throw new Error(`TaskRepository.addSubtask: task ${taskId} not found`);
    }
    const subtask: Subtask = { id: crypto.randomUUID(), title, done: false };
    return this.update(taskId, { subtasks: [...task.subtasks, subtask] });
  }

  async toggleSubtask(taskId: string, subtaskId: string): Promise<Task> {
    const task = await this.getById(taskId);
    if (!task) {
      throw new Error(`TaskRepository.toggleSubtask: task ${taskId} not found`);
    }
    const subtasks = task.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s));
    return this.update(taskId, { subtasks });
  }

  async removeSubtask(taskId: string, subtaskId: string): Promise<Task> {
    const task = await this.getById(taskId);
    if (!task) {
      throw new Error(`TaskRepository.removeSubtask: task ${taskId} not found`);
    }
    const subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
    return this.update(taskId, { subtasks });
  }

  /** Tasks due today or earlier (and not yet done) — what the Today widget shows. */
  async getDueTodayOrOverdue(todayIso: string): Promise<Task[]> {
    const all = await this.getAll();
    return all.filter((t) => t.status === 'todo' && t.dueDate !== null && t.dueDate <= todayIso);
  }
}
