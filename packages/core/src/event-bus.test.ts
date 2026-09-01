import { describe, expect, it, vi } from 'vitest';
import { EventBus } from './event-bus';

describe('EventBus', () => {
  it('calls a listener with the emitted payload', () => {
    const bus = new EventBus();
    const listener = vi.fn();
    bus.on<{ taskId: string }>('focus:session:completed:v1', listener);

    bus.emit('focus:session:completed:v1', { taskId: 'abc-123' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ taskId: 'abc-123' });
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
});
