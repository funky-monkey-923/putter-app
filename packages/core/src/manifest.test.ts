import { describe, expect, it } from 'vitest';
import { ManifestRegistry } from './manifest';

describe('ManifestRegistry', () => {
  it('returns an empty list when nothing is registered — the shell must not crash on this', () => {
    const registry = new ManifestRegistry();
    expect(registry.getAll()).toEqual([]);
  });

  it('registers a tool and returns it from getAll and get', () => {
    const registry = new ManifestRegistry();
    registry.register({ id: 'tasks', displayName: 'Tasks', category: 'plan' });

    expect(registry.getAll()).toHaveLength(1);
    expect(registry.get('tasks')?.displayName).toBe('Tasks');
  });

  it('allows a tool to omit TodayWidget/CommandWidget entirely', () => {
    const registry = new ManifestRegistry();
    registry.register({ id: 'focus', displayName: 'Focus Timer', category: 'rhythm' });

    const manifest = registry.get('focus');
    expect(manifest?.TodayWidget).toBeUndefined();
    expect(manifest?.CommandWidget).toBeUndefined();
  });

  it('returns undefined for an id that was never registered', () => {
    const registry = new ManifestRegistry();
    expect(registry.get('nonexistent')).toBeUndefined();
  });
});
