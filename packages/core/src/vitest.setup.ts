// Gives Dexie a working IndexedDB implementation inside Node (Vitest's test
// environment has no real browser IndexedDB) — see Architecture Plan's
// testing strategy: "Unit tests (Vitest): the core package first."
import 'fake-indexeddb/auto';
