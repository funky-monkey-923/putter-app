/**
 * The recurring-task engine — built once here in core (not inside
 * packages/tool-tasks) specifically so Habit Tracker (M3) and Self-Care
 * Routines (M4) can reuse the exact same date math instead of each
 * reimplementing it, per Putter-Build-Roadmap.md's M1 goal ("the recurring
 * task engine other tools will later reuse").
 *
 * Deliberately narrow scope for v1, per the roadmap's own anticipated-issues
 * note: "every Monday," "every 3 days," "last day of the month" all have
 * real edge cases, so v1 only supports daily / weekly / a generic custom-day
 * interval — not full calendar-rule recurrence (that's a T2+ feature).
 */
export type RecurrenceRule =
  | { type: 'daily'; interval: number }
  | { type: 'weekly'; interval: number }
  | { type: 'custom-interval'; days: number };

/**
 * Computes the next due date for a recurring item.
 *
 * Deliberate policy choice (this is the answer to the roadmap's own
 * "what happens to a recurring task after you complete it?" question):
 * the next occurrence is anchored to the actual completion time, not the
 * original scheduled due date. Completing three days late doesn't create
 * a pile-up of missed occurrences — it just schedules the next one
 * `interval` days after whenever you actually completed it. This is the
 * same policy most recurring-task apps default to (e.g. Todoist), chosen
 * specifically because it's simple to explain and doesn't punish lateness
 * with cascading overdue occurrences.
 */
export function computeNextDueDate(rule: RecurrenceRule, completedOn: string): string {
  const addDays = getIntervalInDays(rule);
  const base = new Date(completedOn);
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + addDays);
  return next.toISOString();
}

function getIntervalInDays(rule: RecurrenceRule): number {
  switch (rule.type) {
    case 'daily':
      return rule.interval;
    case 'weekly':
      return rule.interval * 7;
    case 'custom-interval':
      return rule.days;
  }
}
