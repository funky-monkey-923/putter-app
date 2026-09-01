import type { Table, UpdateSpec } from 'dexie';
import type { BaseEntity } from './entity';
import type { Repository } from './repository';

/**
 * A generic Dexie-backed base class every tool's repository extends, so
 * CRUD + soft-delete + the sync-hook stubs are written once here, not
 * reimplemented per tool. Subclasses pass in their own Dexie Table.
 *
 * Note on getAll(): filters in JS for now rather than an indexed query,
 * which is fine at M0 with no real data. Once a tool has real query
 * patterns and real data volume, override with the compound-index
 * approach from Architecture Plan §7 rather than relying on this default.
 */
export abstract class DexieRepository<T extends BaseEntity> implements Repository<T> {
  protected constructor(protected table: Table<T, string>) {}

  async create(entity: T): Promise<T> {
    await this.table.put(entity);
    return entity;
  }

  async update(id: string, changes: Partial<T>): Promise<T> {
    const patch = { ...changes, updatedAt: new Date().toISOString() } as unknown as UpdateSpec<T>;
    await this.table.update(id, patch);
    const updated = await this.table.get(id);
    if (!updated) {
      throw new Error(`DexieRepository.update: record ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.table.update(id, { deletedAt: new Date().toISOString() } as unknown as UpdateSpec<T>);
  }

  async getById(id: string): Promise<T | undefined> {
    return this.table.get(id);
  }

  async getAll(): Promise<T[]> {
    const all = await this.table.toArray();
    return all.filter((entity) => entity.deletedAt === null);
  }

  async pushChanges(_since: string): Promise<T[]> {
    throw new Error('pushChanges is reserved for a future sync connector — not implemented yet.');
  }

  async pullChanges(_remoteChanges: T[]): Promise<void> {
    throw new Error('pullChanges is reserved for a future sync connector — not implemented yet.');
  }
}
