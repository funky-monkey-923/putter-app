import type { Table } from 'dexie';
import { db, DexieRepository, eventBus } from '@putter/core';
import './db'; // side effect: registers the focusSessions schema (version 2)
import { makeFocusSession } from './factories';
import type { FocusSession } from './types';

export class FocusSessionRepository extends DexieRepository<FocusSession> {
  constructor() {
    super(db.table('focusSessions') as Table<FocusSession, string>);
  }

  async startSession(input: { plannedMinutes: number; taskId?: string | null; taskTitle?: string | null }): Promise<FocusSession> {
    const session = makeFocusSession(input);
    await this.create(session);
    return session;
  }

  /**
   * Ends a session and — this is the actual point of M2 — emits the
   * `focus:session:completed:v1` event so Task Manager (or any future
   * listener) can react, without this file importing anything from
   * `@putter/tool-tasks`. The event only fires here, once, after the
   * session's own row is safely updated first — so a listener throwing
   * (handled internally by EventBus.emit's try/catch) can never corrupt
   * this repository's own data.
   */
  async completeSession(id: string, actualMinutes: number): Promise<FocusSession> {
    const session = await this.getById(id);
    if (!session) {
      throw new Error(`FocusSessionRepository.completeSession: session ${id} not found`);
    }
    const completedAt = new Date().toISOString();
    const updated = await this.update(id, { actualMinutes, completedAt });

    eventBus.emit('focus:session:completed:v1', {
      taskId: session.taskId,
      durationMinutes: actualMinutes,
      completedAt,
    });

    return updated;
  }

  /**
   * Cancels an in-progress session without emitting completion (e.g. the
   * user hit "give up"). Soft-deletes it (via the inherited delete()),
   * consistent with every other repository in the app — it won't show up
   * in getAll()/getTodaySessions(), but the row isn't physically removed.
   */
  async cancelSession(id: string): Promise<void> {
    await this.delete(id);
  }

  /** Completed sessions from today — what the Today widget's session list shows. */
  async getTodaySessions(todayIso: string): Promise<FocusSession[]> {
    const all = await this.getAll();
    return all.filter((s) => s.completedAt !== null && s.completedAt.slice(0, 10) === todayIso);
  }
}
