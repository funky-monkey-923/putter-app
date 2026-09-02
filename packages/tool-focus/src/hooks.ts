import { useEffect, useRef, useState } from 'react';

/**
 * A simple, single-purpose countdown: ticks every second while `running`,
 * calls `onComplete` exactly once when it reaches zero. Shared by both the
 * Today widget's quick-start timer and the full view's configurable one,
 * so the actual timing logic isn't duplicated between them.
 */
export function useCountdown(totalSeconds: number, running: boolean, onComplete: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && remaining === 0) {
      onCompleteRef.current();
    }
  }, [running, remaining]);

  return remaining;
}

export function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
