/**
 * Streak-calculation engine for Habit Tracker (M3). Conceptually in the
 * same spirit as recurrence.ts (M1's recurring-task engine) — "how often
 * is this expected" — but the actual logic doesn't turn out to be very
 * shareable: tasks track ONE next-due-date that advances on completion,
 * while habits track a LOG of completed days and need to know how many
 * consecutive expected periods in a row were actually hit. Kept as its
 * own file rather than bolted onto recurrence.ts's RecurrenceRule type,
 * per the Build Roadmap's own anticipated-issue note for this phase:
 * "if reuse feels awkward, that's a real signal to surface... rather than
 * force through or silently duplicate logic." This is that signal,
 * surfaced rather than hidden — the day-math helpers below (addDays,
 * daysBetween) are the same *kind* of date arithmetic as recurrence.ts,
 * just not literally the same function, since the two problems shape it
 * differently.
 */
export type HabitFrequency =
  | { type: 'daily' }
  | { type: 'timesPerWeek'; count: number }
  | { type: 'everyNDays'; days: number };

function addDays(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(earlier: string, later: string): number {
  const a = new Date(`${earlier}T00:00:00.000Z`).getTime();
  const b = new Date(`${later}T00:00:00.000Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Monday-start ISO week key (e.g. "2026-W01") — weeks group cleanly regardless of which day of the week "today" falls on. */
function isoWeekKey(dateIso: string): string {
  const date = new Date(`${dateIso}T00:00:00.000Z`);
  const isoDayIndex = (date.getUTCDay() + 6) % 7; // 0=Mon..6=Sun
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - isoDayIndex);
  const year = monday.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstMonday = new Date(firstThursday);
  firstMonday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7));
  const weekNum = Math.round((monday.getTime() - firstMonday.getTime()) / (7 * 86_400_000)) + 1;
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * The current streak, as of `todayIso`. Each frequency type gets a grace
 * period for the still-in-progress "current" period (today, for daily;
 * this week, for timesPerWeek) — not having completed it YET doesn't
 * break the streak, only actually missing a fully-elapsed period does.
 * This matches the common habit-app convention (a streak doesn't reset to
 * zero the moment the clock passes midnight without you doing anything —
 * it resets when you've actually missed a whole day).
 */
export function computeCurrentStreak(frequency: HabitFrequency, completions: string[], todayIso: string): number {
  const done = new Set(completions);

  if (frequency.type === 'daily') {
    const startCursor = done.has(todayIso) ? todayIso : addDays(todayIso, -1);
    if (!done.has(startCursor)) return 0;
    let streak = 0;
    let cursor = startCursor;
    while (done.has(cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  if (frequency.type === 'everyNDays') {
    if (completions.length === 0) return 0;
    const sorted = [...new Set(completions)].sort().reverse(); // most recent first
    if (daysBetween(sorted[0], todayIso) > frequency.days) return 0; // already missed the window
    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = daysBetween(sorted[i + 1], sorted[i]);
      if (gap > frequency.days) break;
      streak++;
    }
    return streak;
  }

  // timesPerWeek
  const completionsPerWeek = new Map<string, number>();
  for (const d of completions) {
    const key = isoWeekKey(d);
    completionsPerWeek.set(key, (completionsPerWeek.get(key) ?? 0) + 1);
  }
  const currentWeek = isoWeekKey(todayIso);
  const weekKeys = Array.from(completionsPerWeek.keys()).sort().reverse();
  let streak = 0;
  for (const week of weekKeys) {
    const count = completionsPerWeek.get(week)!;
    const met = count >= frequency.count;
    if (week === currentWeek) {
      if (met) streak++;
      continue; // in-progress week never breaks the streak, met or not
    }
    if (!met) break;
    streak++;
  }
  return streak;
}

/**
 * The longest streak ever recorded. Implemented by "replaying" the
 * current-streak calculation as of each completion date — simplest
 * correct approach, not the most efficient, which is a fine tradeoff at
 * habit-tracker data volumes (hundreds to low thousands of completions
 * per habit, not millions).
 */
export function computeLongestStreak(frequency: HabitFrequency, completions: string[]): number {
  if (completions.length === 0) return 0;
  const sorted = [...new Set(completions)].sort();
  let longest = 0;
  for (const asOfDate of sorted) {
    longest = Math.max(longest, computeCurrentStreak(frequency, completions, asOfDate));
  }
  return longest;
}
