import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { TaskRepository } from './task-repository';
import { ProjectRepository } from './project-repository';
import { makeTask, makeProject } from './factories';
import type { Task, Project, TaskPriority } from './types';
import type { RecurrenceRule } from '@putter/core';

const taskRepo = new TaskRepository();
const projectRepo = new ProjectRepository();

/**
 * The Task Manager's full page — everything the Today widget deliberately
 * leaves out: creating/editing tasks, subtasks, projects, recurrence.
 * Kept intentionally plain (no drag-and-drop, no Kanban board — both real
 * T2/T3 Master Feature List items, not v1) per the roadmap's explicit
 * "temptation to add just one more view" warning for this exact tool.
 */
function TaskManagerView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newProjectId, setNewProjectId] = useState<string>('');
  const [newRecurs, setNewRecurs] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  async function refresh() {
    const [allTasks, allProjects] = await Promise.all([taskRepo.getAll(), projectRepo.getAll()]);
    setTasks(allTasks);
    setProjects(allProjects);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const recurrence: RecurrenceRule | null = newRecurs ? { type: 'daily', interval: 1 } : null;
    const task = makeTask({
      title: newTitle.trim(),
      dueDate: newDueDate || null,
      priority: newPriority,
      projectId: newProjectId || null,
      recurrence,
    });
    await taskRepo.create(task);
    setNewTitle('');
    setNewDueDate('');
    setNewPriority('medium');
    setNewRecurs(false);
    await refresh();
  }

  async function handleAddProject(e: FormEvent) {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    await projectRepo.create(makeProject({ title: newProjectTitle.trim() }));
    setNewProjectTitle('');
    await refresh();
  }

  async function handleToggleComplete(task: Task) {
    if (task.status === 'done') {
      await taskRepo.reopenTask(task.id);
    } else {
      await taskRepo.completeTask(task.id);
    }
    await refresh();
  }

  async function handleDelete(id: string) {
    await taskRepo.delete(id);
    await refresh();
  }

  async function handleAddSubtask(taskId: string, title: string) {
    if (!title.trim()) return;
    await taskRepo.addSubtask(taskId, title.trim());
    await refresh();
  }

  async function handleToggleSubtask(taskId: string, subtaskId: string) {
    await taskRepo.toggleSubtask(taskId, subtaskId);
    await refresh();
  }

  const projectTitleFor = (projectId: string | null) =>
    projectId ? (projects.find((p) => p.id === projectId)?.title ?? 'Unknown list') : null;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="font-display text-xl text-ink mb-2">Add a task</h2>
        <form onSubmit={handleAddTask} className="flex flex-wrap gap-2 items-end">
          <input
            className="border border-taupe rounded px-2 py-1 text-sm"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            type="date"
            className="border border-taupe rounded px-2 py-1 text-sm"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
          <select
            className="border border-taupe rounded px-2 py-1 text-sm"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            className="border border-taupe rounded px-2 py-1 text-sm"
            value={newProjectId}
            onChange={(e) => setNewProjectId(e.target.value)}
          >
            <option value="">No list</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-sm text-ink-soft">
            <input type="checkbox" checked={newRecurs} onChange={(e) => setNewRecurs(e.target.checked)} />
            Repeats daily
          </label>
          <button
            type="submit"
            className="bg-sage text-white rounded px-3 py-1 text-sm"
          >
            Add
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Lists</h2>
        <form onSubmit={handleAddProject} className="flex gap-2 mb-2">
          <input
            className="border border-taupe rounded px-2 py-1 text-sm"
            placeholder="New list name"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
          />
          <button type="submit" className="bg-lavender text-white rounded px-3 py-1 text-sm">
            Create list
          </button>
        </form>
        <ul className="text-sm text-ink-soft flex gap-3 flex-wrap">
          {projects.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-ink-soft text-sm">No tasks yet — add one above.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                projectLabel={projectTitleFor(task.projectId)}
                onToggleComplete={() => handleToggleComplete(task)}
                onDelete={() => handleDelete(task.id)}
                onAddSubtask={(title) => handleAddSubtask(task.id, title)}
                onToggleSubtask={(subtaskId) => handleToggleSubtask(task.id, subtaskId)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TaskRow({
  task,
  projectLabel,
  onToggleComplete,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
}: {
  task: Task;
  projectLabel: string | null;
  onToggleComplete: () => void;
  onDelete: () => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
}) {
  const [subtaskTitle, setSubtaskTitle] = useState('');

  return (
    <li className="rounded-lg border border-taupe bg-card p-3">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={task.status === 'done'}
          onChange={onToggleComplete}
          aria-label={`Mark ${task.title} as ${task.status === 'done' ? 'not done' : 'done'}`}
        />
        <span className={task.status === 'done' ? 'text-ink-soft line-through' : 'text-ink'}>{task.title}</span>
        {task.recurrence && <span className="text-xs font-mono text-sage">↻ repeats</span>}
        {task.dueDate && <span className="text-xs font-mono text-ink-soft">due {task.dueDate}</span>}
        {projectLabel && <span className="text-xs font-mono text-lavender">{projectLabel}</span>}
        <span className="text-xs font-mono text-clay">{task.priority}</span>
        <button onClick={onDelete} className="ml-auto text-xs text-ink-soft underline">
          Delete
        </button>
      </div>

      {task.subtasks.length > 0 && (
        <ul className="mt-2 ml-6 flex flex-col gap-1">
          {task.subtasks.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.done}
                onChange={() => onToggleSubtask(s.id)}
                aria-label={`Subtask: ${s.title}`}
              />
              <span className={s.done ? 'text-ink-soft line-through' : 'text-ink'}>{s.title}</span>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-2 ml-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAddSubtask(subtaskTitle);
          setSubtaskTitle('');
        }}
      >
        <input
          className="border border-taupe rounded px-2 py-0.5 text-xs"
          placeholder="Add a subtask"
          value={subtaskTitle}
          onChange={(e) => setSubtaskTitle(e.target.value)}
        />
        <button type="submit" className="text-xs text-sage underline">
          Add
        </button>
      </form>
    </li>
  );
}

export default TaskManagerView;
