import { db } from '@putter/core';

/**
 * Schema version 3 — Task Manager took version 1 (M1), Focus Timer took
 * version 2 (M2). Same multi-tool-versioned-schema pattern proven in
 * packages/core/src/db-integration.test.ts, now a third real user of it.
 */
db.version(3).stores({
  habits: 'id, updatedAt, deletedAt',
});
