import { eventBus } from '@putter/core';
import { TaskRepository } from './task-repository';

/**
 * Task Manager's half of M2's whole point: reacting to another tool's
 * event without importing that tool's code at all. This file has no
 * import of `@putter/tool-focus` anywhere — the only coupling is the
 * event NAME (`focus:session:completed:v1`), whose payload shape is
 * type-checked against the shared `EventMap` in `@putter/core` (see
 * that file's doc comment for why the catalog lives there).
 *
 * Called once from the app's entry point, alongside registerTasksTool() —
 * see apps/web/src/main.tsx.
 */
export function subscribeTasksToFocusEvents(): void {
  const tasks = new TaskRepository();

  eventBus.on('focus:session:completed:v1', async (payload) => {
    if (payload.taskId === null) {
      return; // an unlinked focus session — nothing to log time against.
    }
    try {
      await tasks.logTime(payload.taskId, payload.durationMinutes);
    } catch (err) {
      // The linked task may have been deleted since the session started —
      // that's a real, expected case (not a bug), so log and move on
      // rather than let it become an unhandled rejection.
      console.warn(`subscribeTasksToFocusEvents: could not log time for task ${payload.taskId}`, err);
    }
  });
}
