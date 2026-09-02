import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@putter/core';
import { TaskRepository } from './task-repository';
import { ProjectRepository } from './project-repository';
import { makeTask, makeProject } from './factories';

describe('TaskRepository', () => {
  let tasks: TaskRepository;

  beforeEach(async () => {
    tasks = new TaskRepository();
    // Shared db singleton persists across tests in this file — clear both
    // tables so tests don't see each other's data (same pattern as
    // packages/core/src/db-integration.test.ts). Both tables' schema is
    // already registered as a side effect of importing task-repository.ts.
    await db.table('tasks').clear();
    await db.table('projects').clear();
  });

  it('creates a task with sane defaults via makeTask()', async () => {
    const task = makeTask({ title: 'Write tests' });
    await tasks.create(task);

    const found = await tasks.getById(task.id);
    expect(found?.title).toBe('Write tests');
    expect(found?.status).toBe('todo');
    expect(found?.priority).toBe('medium');
    expect(found?.subtasks).toEqual([]);
  });

  it('completeTask() marks a non-recurring task done', async () => {
    const task = makeTask({ title: 'One-off task' });
    await tasks.create(task);

    const completed = await tasks.completeTask(task.id);

    expect(completed.status).toBe('done');
    expect(completed.completedAt).not.toBeNull();
  });

  it('completeTask() on a recurring task resets it to todo with an advanced dueDate, not a duplicate row', async () => {
    const task = makeTask({
      title: 'Water the plants',
      dueDate: '2026-01-01',
      recurrence: { type: 'daily', interval: 1 },
    });
    await tasks.create(task);

    const completed = await tasks.completeTask(task.id);

    expect(completed.status).toBe('todo');
    // Anchored to the actual completion time (now), not the original
    // dueDate — see completeTask()'s doc comment for why. So the new
    // dueDate should be "tomorrow relative to today," not derived from the
    // stale 2026-01-01 the task was originally scheduled for.
    const expectedNextDueDate = new Date();
    expectedNextDueDate.setUTCDate(expectedNextDueDate.getUTCDate() + 1);
    expect(completed.dueDate).toBe(expectedNextDueDate.toISOString().slice(0, 10));
    expect(completed.completedAt).not.toBeNull();
    // Still the same row, not a new one.
    expect(await tasks.getAll()).toHaveLength(1);
  });

  it('reopenTask() undoes a completed non-recurring task', async () => {
    const task = makeTask({ title: 'Oops, not done yet' });
    await tasks.create(task);
    await tasks.completeTask(task.id);

    const reopened = await tasks.reopenTask(task.id);

    expect(reopened.status).toBe('todo');
    expect(reopened.completedAt).toBeNull();
  });

  it('addSubtask()/toggleSubtask()/removeSubtask() manage a task\'s checklist', async () => {
    const task = makeTask({ title: 'Plan trip' });
    await tasks.create(task);

    const withSubtask = await tasks.addSubtask(task.id, 'Book flights');
    expect(withSubtask.subtasks).toHaveLength(1);
    const subtaskId = withSubtask.subtasks[0].id;
    expect(withSubtask.subtasks[0].done).toBe(false);

    const toggled = await tasks.toggleSubtask(task.id, subtaskId);
    expect(toggled.subtasks[0].done).toBe(true);

    const removed = await tasks.removeSubtask(task.id, subtaskId);
    expect(removed.subtasks).toHaveLength(0);
  });

  it('getDueTodayOrOverdue() returns only incomplete tasks due today or earlier', async () => {
    await tasks.create(makeTask({ title: 'Overdue', dueDate: '2026-01-01' }));
    await tasks.create(makeTask({ title: 'Due today', dueDate: '2026-01-05' }));
    await tasks.create(makeTask({ title: 'Due later', dueDate: '2026-01-10' }));
    await tasks.create(makeTask({ title: 'No due date' }));
    const alreadyDone = makeTask({ title: 'Already done', dueDate: '2026-01-01' });
    await tasks.create(alreadyDone);
    await tasks.completeTask(alreadyDone.id);

    const due = await tasks.getDueTodayOrOverdue('2026-01-05');

    expect(due.map((t) => t.title).sort()).toEqual(['Due today', 'Overdue']);
  });

  it('rejects an id collision instead of silently overwriting (inherited from DexieRepository)', async () => {
    const task = makeTask({ title: 'First' });
    await tasks.create(task);
    await expect(tasks.create({ ...task, title: 'Second' })).rejects.toThrow();
  });

  it('logTime() adds to a task\'s running loggedMinutes total rather than replacing it', async () => {
    const task = makeTask({ title: 'Deep work' });
    await tasks.create(task);
    expect((await tasks.getById(task.id))?.loggedMinutes).toBe(0);

    await tasks.logTime(task.id, 25);
    await tasks.logTime(task.id, 15);

    const updated = await tasks.getById(task.id);
    expect(updated?.loggedMinutes).toBe(40);
  });

  it('getLinkableTasks() returns only open tasks, as the plain {id, title} shape getLinkables expects', async () => {
    const open = makeTask({ title: 'Still open' });
    const done = makeTask({ title: 'Already done' });
    await tasks.create(open);
    await tasks.create(done);
    await tasks.completeTask(done.id);

    const linkable = await tasks.getLinkableTasks();

    expect(linkable).toEqual([{ id: open.id, title: 'Still open' }]);
  });
});

describe('ProjectRepository', () => {
  beforeEach(async () => {
    await db.table('projects').clear();
  });

  it('creates and lists a project', async () => {
    const projects = new ProjectRepository();
    await projects.create(makeProject({ title: 'Home renovation' }));

    const all = await projects.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Home renovation');
  });
});
