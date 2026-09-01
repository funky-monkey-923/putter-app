import Dexie from 'dexie';

/**
 * The single shared Dexie database for all of Putter. packages/core
 * intentionally defines zero tables itself — there is no "core" data, only
 * the shared connection every tool builds on. Each tool package adds its
 * own table(s) by calling `db.version(N).stores({...})` with an
 * incrementing version number (and a migration function once a tool's
 * schema needs to change) — see Architecture Plan §5.
 */
export class PutterDatabase extends Dexie {
  constructor() {
    super('putter');
  }
}

export const db = new PutterDatabase();
