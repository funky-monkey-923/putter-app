/**
 * Lets tools react to each other's actions without importing each other's
 * internals (Product Plan §4, §8a). Event NAMES are versioned explicitly
 * (e.g. "focus:session:completed:v1") so a future change to an event's
 * payload shape becomes a new event name, not a silent breaking change to
 * existing listeners — see Architecture Plan §11, residual risk #1.
 */
type Listener<T> = (payload: T) => void;

/**
 * The catalog of every event that actually crosses a tool-package
 * boundary, with its real payload shape — the retrofit promised in
 * KNOWN-ISSUES.md back at M0 ("once Focus Timer emits and Task Manager
 * listens, retrofit a typed EventMap from that real pair"). This is that
 * pair: M2 (Focus Timer) is the first tool to emit an event something else
 * actually listens for.
 *
 * Deliberately centralized here in core, as one growing catalog, rather
 * than each tool augmenting it via `declare module` — with only a couple
 * of cross-tool events so far, one file that shows the whole event
 * contract is easier to read than declarations scattered across packages.
 * Revisit that choice (per-tool module augmentation instead) if this file
 * ever gets unwieldy — e.g. once 4-5 tools are each emitting several
 * events of their own.
 *
 * `on`/`emit` below are typed against this map when the event name is one
 * they recognize, and fall back to an untyped generic for anything not
 * yet cataloged — so adding a new tool's events here is additive, never a
 * breaking change to existing callers.
 */
export interface EventMap {
  'focus:session:completed:v1': {
    /** null if the session wasn't linked to a task. */
    taskId: string | null;
    durationMinutes: number;
    completedAt: string;
  };
}

export class EventBus {
  // The internal store necessarily erases each listener's specific payload
  // type, since one bus holds listeners for many differently-shaped events —
  // type safety is enforced at the public on<T>/emit<T> boundary instead,
  // which is the standard shape for a typed event emitter's internals.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new Map<string, Set<Listener<any>>>();

  on<K extends keyof EventMap>(eventName: K, listener: Listener<EventMap[K]>): () => void;
  on<T>(eventName: string, listener: Listener<T>): () => void;
  on(eventName: string, listener: Listener<unknown>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listener);
    return () => {
      this.listeners.get(eventName)?.delete(listener);
    };
  }

  emit<K extends keyof EventMap>(eventName: K, payload: EventMap[K]): void;
  emit<T>(eventName: string, payload: T): void;
  emit(eventName: string, payload: unknown): void {
    // Each listener is isolated so one throwing listener can't block
    // delivery to the rest — flagged in the M0 team review (see
    // Putter-Team-Reviews.md, Review 1, SW Engineer finding #5).
    this.listeners.get(eventName)?.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error(`EventBus: listener for "${eventName}" threw`, err);
      }
    });
  }
}

/** One shared instance every tool package imports — this is the actual "bus". */
export const eventBus = new EventBus();
