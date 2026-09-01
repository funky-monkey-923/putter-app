import type { BaseEntity } from './entity';

/**
 * The interface every tool's repository implements. Includes two
 * unused-for-now sync-hook stubs (Architecture Plan §12, future-readiness
 * audit) so every tool built from here on is sync-connector-ready from
 * birth, instead of needing this interface retrofitted across many tools
 * later once a real sync feature actually gets built.
 */
export interface Repository<T extends BaseEntity> {
  create(entity: T): Promise<T>;
  update(id: string, changes: Partial<T>): Promise<T>;
  /** Soft delete — sets deletedAt, never removes the row. */
  delete(id: string): Promise<void>;
  getById(id: string): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  /**
   * Query by a single indexed field (e.g. a tool's own status/date field),
   * so tools don't have to reach past this abstraction into the raw Dexie
   * Table for anything beyond trivial CRUD. Added after the M0 team review
   * flagged getAll()-plus-JS-filter as the only filtering primitive on offer
   * — see Putter-Team-Reviews.md, Review 1, SW Engineer finding #1.
   */
  getWhere(field: keyof T & string, value: unknown): Promise<T[]>;

  /** Reserved for a future sync connector. Not implemented yet, not called by anything today. */
  pushChanges(since: string): Promise<T[]>;
  /** Reserved for a future sync connector. Not implemented yet, not called by anything today. */
  pullChanges(remoteChanges: T[]): Promise<void>;
}
