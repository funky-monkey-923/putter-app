import { useEffect, useState } from 'react';
import { TaskRepository } from './task-repository';
import type { Task } from './types';

const repo = new TaskRepository();

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The Today-view widget — "what's due/overdue today" per the M1 manifest
 * requirement. Deliberately read-only-ish (just a quick complete checkbox)
 * — anything more belongs in the full view, not the Today summary.
 */
function TaskManagerToday() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const due = await repo.getDueTodayOrOverdue(todayIso());
    setTasks(due.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '')));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleComplete(id: string) {
    await repo.completeTask(id);
    await refresh();
  }

  if (loading) {
    return <p className="text-ink-soft text-sm">Loading…</p>;
  }

  if (tasks.length === 0) {
    return <p className="text-ink-soft text-sm">Nothing due today. Nice.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => {
        const isOverdue = task.dueDate !== null && task.dueDate < todayIso();
        return (
          <li key={task.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={false}
              onChange={() => handleComplete(task.id)}
              aria-label={`Complete ${task.title}`}
            />
            <span className="text-ink">{task.title}</span>
            {isOverdue && <span className="text-clay text-xs font-mono">overdue</span>}
          </li>
        );
      })}
    </ul>
  );
}

export default TaskManagerToday;
