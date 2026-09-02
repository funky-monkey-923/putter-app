import { describe, expect, it, vi } from 'vitest';
import { EventBus } from './event-bus';

describe('EventBus', () => {
  it('calls a listener with the emitted payload', () => {
    const bus = new EventBus();
    const listener = vi.fn();
    bus.on<{ value: string }>('generic:event:v1', listener);

    bus.emit('generic:event:v1', { value: 'abc-123' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ value: 'abc-123' });
  });

  it('type-checks a cataloged event against its real EventMap payload shape', () => {
    const bus = new EventBus();
    const listener = vi.fn();
    bus.on('focus:session:completed:v1', listener);

    const payload = { taskId: 'task-1', durationMinutes: 25, completedAt: '2026-01-01T00:00:00.000Z' };
    bus.emit('focus:session:completed:v1', payload);

    expect(listener).toHaveBeenCalledWith(payload);
  });

  it('stops calling a listener after it unsubscribes', () => {
    const bus = new EventBus();
    const listener = vi.fn();
    const unsubscribe = bus.on('some:event:v1', listener);

    unsubscribe();
    bus.emit('some:event:v1', {});

    expect(listener).not.toHaveBeenCalled();
  });

  it('supports multiple independent listeners on the same event', () => {
    const bus = new EventBus();
    const first = vi.fn();
    const second = vi.fn();
    bus.on('shared:event:v1', first);
    bus.on('shared:event:v1', second);

    bus.emit('shared:event:v1', { value: 42 });

    expect(first).toHaveBeenCalledWith({ value: 42 });
    expect(second).toHaveBeenCalledWith({ value: 42 });
  });

  it('does nothing when emitting an event with no listeners', () => {
    const bus = new EventBus();
    expect(() => bus.emit('nobody:listening:v1', {})).not.toThrow();
  });

  it('isolates a throwing listener so other listeners still get called', () => {
    const bus = new EventBus();
    const throwing = vi.fn(() => {
      throw new Error('boom');
    });
    const healthy = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    bus.on('some:event:v1', throwing);
    bus.on('some:event:v1', healthy);

    expect(() => bus.emit('some:event:v1', { value: 1 })).not.toThrow();

    expect(throwing).toHaveBeenCalledTimes(1);
    expect(healthy).toHaveBeenCalledWith({ value: 1 });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
