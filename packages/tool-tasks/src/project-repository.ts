import type { Table } from 'dexie';
import { db, DexieRepository } from '@putter/core';
import './db'; // side effect: registers the tasks/projects schema (version 1)
import type { Project } from './types';

/**
 * Deliberately just the inherited CRUD — "simple grouping mechanism" per
 * the roadmap means no domain-specific methods are needed yet beyond what
 * DexieRepository already provides.
 */
export class ProjectRepository extends DexieRepository<Project> {
  constructor() {
    super(db.table('projects') as Table<Project, string>);
  }
}
