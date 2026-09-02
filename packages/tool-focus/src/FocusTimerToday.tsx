import { useEffect, useState } from 'react';
import { FocusSessionRepository } from './focus-session-repository';
import { useCountdown, formatMMSS } from './hooks';
import type { FocusSession } from './types';

const repo = new FocusSessionRepository();
const QUICK_START_MINUTES = 25;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The Today-view widget: a quick-start timer (no task linking — that's a
 * FullView feature) and today's completed sessions. Per the M1 pattern:
 * Today stays deliberately simple, the full page is where configuration
 * lives.
 */
function FocusTimerToday() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [todaySessions, setTodaySessions] = useState<FocusSession[]>([]);
  const totalSeconds = QUICK_START_MINUTES * 60;

  async function refresh() {
    setTodaySessions(await repo.getTodaySessions(todayIso()));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleComplete() {
    if (!sessionId) return;
    await repo.completeSession(sessionId, QUICK_START_MINUTES);
    setSessionId(null);
    setRunning(false);
    await refresh();
  }

  const remaining = useCountdown(totalSeconds, running, handleComplete);

  async function handleStart() {
    const session = await repo.startSession({ plannedMinutes: QUICK_START_MINUTES });
    setSessionId(session.id);
    setRunning(true);
  }

  async function handleStop() {
    if (sessionId) {
      await repo.cancelSession(sessionId);
    }
    setSessionId(null);
    setRunning(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {sessionId ? (
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl text-ink">{formatMMSS(remaining)}</span>
          <button onClick={handleStop} className="text-xs text-clay underline">
            Stop
          </button>
        </div>
      ) : (
        <button onClick={handleStart} className="bg-sage text-white rounded px-3 py-1 text-sm w-fit">
          Start a {QUICK_START_MINUTES}-min focus session
        </button>
      )}

      {todaySessions.length > 0 && (
        <p className="text-ink-soft text-xs">
          {todaySessions.length} session{todaySessions.length === 1 ? '' : 's'} today ·{' '}
          {todaySessions.reduce((sum, s) => sum + (s.actualMinutes ?? 0), 0)}m total
        </p>
      )}
    </div>
  );
}

export default FocusTimerToday;
