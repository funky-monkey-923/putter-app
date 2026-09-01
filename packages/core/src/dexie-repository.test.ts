import Dexie, { type Table } from 'dexie';
import { beforeEach, describe, expect, it } from 'vitest';
import type { BaseEntity } from './entity';
import { DexieRepository } from './dexie-repository';

interface TestNote extends BaseEntity {
  body: string;
}

class TestDatabase extends Dexie {
  notes!: Table<TestNote, string>;
  constructor(name: string) {
    super(name);
    this.version(1).stores({ notes: 'id, updatedAt, deletedAt' });
  }
}

class TestNoteRepository extends DexieRepository<TestNote> {
  constructor(db: TestDatabase) {
    super(db.notes);
  }
}

function makeNote(overrides: Partial<TestNote> = {}): TestNote {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type: 'note',
    title: 'Untitled',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    tags: [],
    links: [],
    body: '',
    ...overrides,
  };
}

describe('DexieRepository', () => {
  let db: TestDatabase;
  let repo: TestNoteRepository;

  beforeEach(() => {
    // A fresh database per test (unique name) so tests never see each other's data.
    db = new TestDatabase(`test-db-${crypto.randomUUID()}`);
    repo = new TestNoteRepository(db);
  });

  it('creates and retrieves a record by id', async () => {
    const note = makeNote({ title: 'First note', body: 'hello' });
    await repo.create(note);

    const found = await repo.getById(note.id);
    expect(found?.title).toBe('First note');
    expect(found?.body).toBe('hello');
  });

  it('update() bumps updatedAt and persists the change', async () => {
    const note = makeNote({ title: 'Original' });
    await repo.create(note);

    const updated = await repo.update(note.id, { title: 'Renamed' });

    expect(updated.title).toBe('Renamed');
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(note.updatedAt).getTime());
  });

  it('delete() is a soft delete — the record still exists but is excluded from getAll()', async () => {
    const note = makeNote();
    await repo.create(note);

    await repo.delete(note.id);

    const stillThere = await repo.getById(note.id);
    expect(stillThere?.deletedAt).not.toBeNull();

    const all = await repo.getAll();
    expect(all.find((n) => n.id === note.id)).toBeUndefined();
  });

  it('getAll() excludes soft-deleted records but includes everything else', async () => {
    const kept = makeNote({ title: 'Kept' });
    const removed = makeNote({ title: 'Removed' });
    await repo.create(kept);
    await repo.create(removed);
    await repo.delete(removed.id);

    const all = await repo.getAll();

    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Kept');
  });

  it('pushChanges/pullChanges are reserved stubs, not silently working — Architecture Plan §12', async () => {
    await expect(repo.pushChanges('2026-01-01')).rejects.toThrow(/sync connector/);
    await expect(repo.pullChanges([])).rejects.toThrow(/sync connector/);
  });
});
