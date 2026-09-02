import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db, eventBus } from '@putter/core';
import { FocusSessionRepository } from './focus-session-repository';

describe('FocusSessionRepository', () => {
  let repo: FocusSessionRepository;

  beforeEach(async () => {
    repo = new FocusSessionRepository();
    await db.table('focusSessions').clear();
  });

  it('startSession() creates an in-progress session with no completedAt/actualMinutes yet', async () => {
    const session = await repo.startSession({ plannedMinutes: 25 });

    expect(session.plannedMinutes).toBe(25);
    expect(session.actualMinutes).toBeNull();
    expect(session.completedAt).toBeNull();
    expect(session.taskId).toBeNull();
  });

  it('startSession() can link a task by id and denormalize its title', async () => {
    const session = await repo.startSession({ plannedMinutes: 25, taskId: 'task-1', taskTitle: 'Write the review' });

    expect(session.taskId).toBe('task-1');
    expect(session.taskTitle).toBe('Write the review');
  });

  it('completeSession() sets actualMinutes/completedAt and emits focus:session:completed:v1', async () => {
    const session = await repo.startSession({ plannedMinutes: 25, taskId: 'task-1' });
    const listener = vi.fn();
    eventBus.on('focus:session:completed:v1', listener);

    const completed = await repo.completeSession(session.id, 20);

    expect(completed.actualMinutes).toBe(20);
    expect(completed.completedAt).not.toBeNull();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: 'task-1', durationMinutes: 20 }),
    );
  });

  it('completeSession() on an unlinked session emits taskId: null (no listener side effect expected)', async () => {
    const session = await repo.startSession({ plannedMinutes: 10 });
    const listener = vi.fn();
    eventBus.on('focus:session:completed:v1', listener);

    await repo.completeSession(session.id, 10);

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ taskId: null }));
  });

  it('cancelSession() soft-deletes an in-progress session without emitting completion', async () => {
    const session = await repo.startSession({ plannedMinutes: 25 });
    const listener = vi.fn();
    eventBus.on('focus:session:completed:v1', listener);

    await repo.cancelSession(session.id);

    // Soft delete, consistent with the rest of the app (Architecture Plan
    // §5) — the row still exists with deletedAt set, it's just excluded
    // from getAll()/getTodaySessions().
    const cancelled = await repo.getById(session.id);
    expect(cancelled?.deletedAt).not.toBeNull();
    expect(await repo.getAll()).not.toContainEqual(expect.objectContaining({ id: session.id }));
    expect(listener).not.toHaveBeenCalled();
  });

  it('getTodaySessions() returns only completed sessions from the given day', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const s1 = await repo.startSession({ plannedMinutes: 25 });
    await repo.completeSession(s1.id, 25);
    const s2 = await repo.startSession({ plannedMinutes: 10 });
    // s2 stays in progress — should not show up in "today's completed sessions."

    const todaySessions = await repo.getTodaySessions(today);

    expect(todaySessions).toHaveLength(1);
    expect(todaySessions[0].id).toBe(s1.id);
    expect(await repo.getById(s2.id)).toBeDefined();
  });
});
