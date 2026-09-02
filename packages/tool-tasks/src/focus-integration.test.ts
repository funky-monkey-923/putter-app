import { beforeEach, describe, expect, it } from 'vitest';
import { db, eventBus } from '@putter/core';
import { TaskRepository } from './task-repository';
import { subscribeTasksToFocusEvents } from './focus-integration';
import { makeTask } from './factories';

/**
 * The first real integration test of the whole event-driven architecture
 * (Build Roadmap M2's own words). Deliberately does NOT import anything
 * from packages/tool-focus — it emits the exact event shape Focus Timer
 * emits in real usage, using only `@putter/core`'s eventBus and EventMap,
 * proving Task Manager's reaction works without ever touching Focus
 * Timer's code. That's the actual architectural claim under test here,
 * not just "does logTime() work" (already covered in task-repository.test.ts).
 */
describe('subscribeTasksToFocusEvents (cross-tool integration)', () => {
  beforeEach(async () => {
    await db.table('tasks').clear();
  });

  // Subscribed once for the whole file, not per-test — subscribeTasksToFocusEvents()
  // registers a real listener on the shared eventBus singleton, and
  // registering it again in every `it` would stack up duplicate listeners
  // that persist across tests in this same file.
  subscribeTasksToFocusEvents();

  it('logs time on the linked task when a focus:session:completed:v1 event fires', async () => {
    const tasks = new TaskRepository();
    const task = makeTask({ title: 'Write the M2 review' });
    await tasks.create(task);

    eventBus.emit('focus:session:completed:v1', {
      taskId: task.id,
      durationMinutes: 25,
      completedAt: new Date().toISOString(),
    });

    // The listener is async (it awaits logTime()); give the microtask
    // queue a turn before asserting.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const updated = await tasks.getById(task.id);
    expect(updated?.loggedMinutes).toBe(25);
  });

  it('does nothing when the session was not linked to a task (taskId: null)', async () => {
    // Should not throw, and there's nothing to assert on a specific task
    // since none was linked — this just proves the null case is handled,
    // not silently crashing the listener (which would also break delivery
    // to any other future listener of this same event).
    expect(() =>
      eventBus.emit('focus:session:completed:v1', {
        taskId: null,
        durationMinutes: 10,
        completedAt: new Date().toISOString(),
      }),
    ).not.toThrow();
  });

  it('warns but does not throw if the linked task no longer exists', async () => {
    eventBus.emit('focus:session:completed:v1', {
      taskId: 'deleted-task-id',
      durationMinutes: 25,
      completedAt: new Date().toISOString(),
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    // No assertion needed beyond "the test file doesn't crash" — an
    // unhandled rejection here would fail the test run.
  });
});
