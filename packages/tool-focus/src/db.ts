import { db } from '@putter/core';

/**
 * Schema version 2 — Task Manager (M1) already took version 1 for its
 * tasks/projects tables. Dexie requires ascending, non-colliding version
 * numbers across every table registered on the shared `db` singleton
 * (see packages/core/src/db-integration.test.ts, which specifically
 * tests this multi-tool pattern) — this is that pattern's second real
 * user, not just its test.
 */
db.version(2).stores({
  focusSessions: 'id, updatedAt, deletedAt, taskId, completedAt',
});
