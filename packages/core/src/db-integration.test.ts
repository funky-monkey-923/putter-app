import { afterEach, describe, expect, it } from 'vitest';
import type { Table } from 'dexie';
import { db } from './db';
import { DexieRepository } from './dexie-repository';
import type { BaseEntity } from './entity';

/**
 * The one integration point every future tool package actually depends on:
 * multiple independently-authored packages calling `db.version(N).stores(...)`
 * on the SAME shared `db` singleton, with incrementing version numbers, in
 * whatever order their modules happen to get imported.
 *
 * Flagged as untested in the M0 team review by both the SW Engineer and the
 * Systems Architect (Putter-Team-Reviews.md, Review 1) — the existing
 * dexie-repository.test.ts only ever exercised an isolated Dexie subclass,
 * never the real exported `db`. This test proves the pattern two future
 * tools will actually use works before a second real tool package exists.
 */

interface TestTask extends BaseEntity {
  status: string;
}

interface TestHabit extends BaseEntity {
  streak: number;
}

// Simulates "tool package A" registering its table at version 1 — the
// first tool to ever extend the shared db.
db.version(1).stores({ tasks: 'id, updatedAt, deletedAt, status' });

// Simulates "tool package B" registering its table at version 2 — imported
// and evaluated after package A's, exactly like a second real tool would be.
db.version(2).stores({ habits: 'id, updatedAt, deletedAt' });

class TestTaskRepository extends DexieRepository<TestTask> {
  constructor() {
    super(db.table('tasks') as Table<TestTask, string>);
  }
}

class TestHabitRepository extends DexieRepository<TestHabit> {
  constructor() {
    super(db.table('habits') as Table<TestHabit, string>);
  }
}

function makeEntity<T extends BaseEntity>(overrides: Partial<T> = {}): T {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type: 'test',
    title: 'Untitled',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    tags: [],
    links: [],
    ...overrides,
  } as unknown as T;
}

describe('shared db singleton — multi-tool versioned schema', () => {
  // Unlike dexie-repository.test.ts's isolated TestDatabase (fresh instance
  // per test), this file deliberately exercises the ONE real shared `db`
  // singleton, so each test clears its own tables afterward rather than
  // getting a fresh database.
  afterEach(async () => {
    await db.table('tasks').clear();
    await db.table('habits').clear();
  });

  it('two independently-versioned tool tables coexist on one Dexie instance', async () => {
    const tasks = new TestTaskRepository();
    const habits = new TestHabitRepository();

    const task = makeEntity<TestTask>({ type: 'task', title: 'Write tests', status: 'todo' });
    const habit = makeEntity<TestHabit>({ type: 'habit', title: 'Stretch', streak: 3 });

    await tasks.create(task);
    await habits.create(habit);

    const foundTask = await tasks.getById(task.id);
    const foundHabit = await habits.getById(habit.id);

    expect(foundTask?.title).toBe('Write tests');
    expect(foundHabit?.streak).toBe(3);

    // Each repository's getAll() only sees its own table — no cross-tool bleed.
    expect(await tasks.getAll()).toHaveLength(1);
    expect(await habits.getAll()).toHaveLength(1);
  });

  it('getWhere() works against a real indexed field on the shared db', async () => {
    const tasks = new TestTaskRepository();
    await tasks.create(makeEntity<TestTask>({ type: 'task', title: 'Due today', status: 'todo' }));
    await tasks.create(makeEntity<TestTask>({ type: 'task', title: 'Also due today', status: 'todo' }));
    await tasks.create(makeEntity<TestTask>({ type: 'task', title: 'Done already', status: 'done' }));

    const todo = await tasks.getWhere('status', 'todo');

    expect(todo).toHaveLength(2);
    expect(todo.every((t) => t.status === 'todo')).toBe(true);
  });
});
