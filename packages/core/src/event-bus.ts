/**
 * Lets tools react to each other's actions without importing each other's
 * internals (Product Plan §4, §8a). Event NAMES are versioned explicitly
 * (e.g. "focus:session:completed:v1") so a future change to an event's
 * payload shape becomes a new event name, not a silent breaking change to
 * existing listeners — see Architecture Plan §11, residual risk #1.
 */
type Listener<T> = (payload: T) => void;

export class EventBus {
  // The internal store necessarily erases each listener's specific payload
  // type, since one bus holds listeners for many differently-shaped events —
  // type safety is enforced at the public on<T>/emit<T> boundary instead,
  // which is the standard shape for a typed event emitter's internals.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new Map<string, Set<Listener<any>>>();

  on<T>(eventName: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.listeners.get(eventName)!.add(listener as Listener<any>);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.listeners.get(eventName)?.delete(listener as Listener<any>);
    };
  }

  emit<T>(eventName: string, payload: T): void {
    this.listeners.get(eventName)?.forEach((listener) => listener(payload));
  }
}

/** One shared instance every tool package imports — this is the actual "bus". */
export const eventBus = new EventBus();
