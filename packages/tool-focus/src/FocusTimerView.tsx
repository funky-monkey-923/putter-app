import { useEffect, useState } from 'react';
import { toolRegistry } from '@putter/core';
import { FocusSessionRepository } from './focus-session-repository';
import { useCountdown, formatMMSS } from './hooks';
import type { FocusSession } from './types';

const repo = new FocusSessionRepository();

/**
 * The full page: a configurable timer (any length, optionally linked to a
 * task) and session history/stats. The task picker calls the linked
 * tool's manifest through `toolRegistry` by string id ('tasks') — this
 * file has no import of `@putter/tool-tasks` anywhere, per M2's actual
 * point (see packages/core/src/manifest.ts's getLinkables doc comment).
 */
function FocusTimerView() {
  const [plannedMinutes, setPlannedMinutes] = useState(25);
  const [linkableTasks, setLinkableTasks] = useState<Array<{ id: string; title: string }>>([]);
  const [taskId, setTaskId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const totalSeconds = plannedMinutes * 60;

  async function refreshHistory() {
    const all = await repo.getAll();
    setSessions(all.filter((s) => s.completedAt !== null).sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')));
  }

  async function refreshLinkableTasks() {
    // 'tasks' may not be registered (e.g. if this tool is ever used
    // standalone) — getLinkables is optional for exactly that reason.
    const tasks = await toolRegistry.get('tasks')?.getLinkables?.();
    setLinkableTasks(tasks ?? []);
  }

  useEffect(() => {
    refreshHistory();
    refreshLinkableTasks();
  }, []);

  async function handleComplete() {
    if (!sessionId) return;
    const elapsedSeconds = totalSeconds - remaining;
    const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    await repo.completeSession(sessionId, actualMinutes);
    setSessionId(null);
    setRunning(false);
    await refreshHistory();
  }

  const remaining = useCountdown(totalSeconds, running, handleComplete);

  async function handleStart() {
    const linkedTask = linkableTasks.find((t) => t.id === taskId);
    const session = await repo.startSession({
      plannedMinutes,
      taskId: linkedTask?.id ?? null,
      taskTitle: linkedTask?.title ?? null,
    });
    setSessionId(session.id);
    setRunning(true);
  }

  async function handleCancel() {
    if (sessionId) {
      await repo.cancelSession(sessionId);
    }
    setSessionId(null);
    setRunning(false);
  }

  const todayCount = sessions.filter((s) => s.completedAt?.startsWith(new Date().toISOString().slice(0, 10))).length;
  const todayMinutes = sessions
    .filter((s) => s.completedAt?.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((sum, s) => sum + (s.actualMinutes ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="font-display text-xl text-ink mb-2">Focus Timer</h2>

        {sessionId ? (
          <div className="flex flex-col items-start gap-2">
            <span className="font-mono text-5xl text-ink">{formatMMSS(remaining)}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setRunning((r) => !r)}
                className="bg-lavender text-white rounded px-3 py-1 text-sm"
              >
                {running ? 'Pause' : 'Resume'}
              </button>
              <button onClick={handleComplete} className="bg-sage text-white rounded px-3 py-1 text-sm">
                Complete now
              </button>
              <button onClick={handleCancel} className="text-xs text-clay underline">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-end">
            <label className="flex flex-col text-xs text-ink-soft">
              Minutes
              <input
                type="number"
                min={1}
                max={180}
                value={plannedMinutes}
                onChange={(e) => setPlannedMinutes(Math.max(1, Number(e.target.value) || 1))}
                className="border border-taupe rounded px-2 py-1 text-sm w-20"
              />
            </label>
            <label className="flex flex-col text-xs text-ink-soft">
              Link to a task (optional)
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="border border-taupe rounded px-2 py-1 text-sm"
              >
                <option value="">No task</option>
                {linkableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={handleStart} className="bg-sage text-white rounded px-3 py-1 text-sm">
              Start
            </button>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Today</h2>
        <p className="text-ink-soft text-sm">
          {todayCount} session{todayCount === 1 ? '' : 's'} · {todayMinutes}m total
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Session history</h2>
        {sessions.length === 0 ? (
          <p className="text-ink-soft text-sm">No completed sessions yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {sessions.map((s) => (
              <li key={s.id} className="text-sm text-ink-soft flex gap-3">
                <span className="font-mono text-ink">{s.actualMinutes}m</span>
                <span>{s.taskTitle ?? 'No linked task'}</span>
                <span className="text-xs">{s.completedAt?.slice(0, 16).replace('T', ' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default FocusTimerView;
