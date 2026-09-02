import { db } from '@putter/core';

/**
 * Schema version 1 — the first real tool tables ever added to the shared
 * `db` singleton (Task Manager is M1, the first real tool package). Must
 * run before anything calls db.open() implicitly (i.e. before the first
 * real query) — importing this module from the app's entry point before
 * rendering guarantees that.
 *
 * Both `tasks` and `projects` are registered in the same version bump
 * since they ship together as one tool and there's no reason to version
 * them independently — see Architecture Plan §5 on schema versioning.
 */
db.version(1).stores({
  tasks: 'id, updatedAt, deletedAt, status, dueDate, projectId',
  projects: 'id, updatedAt, deletedAt',
});
