/**
 * Requests persistent storage so the browser is less likely to silently
 * evict IndexedDB data under storage pressure (Architecture Plan §6.3).
 * `persist()` alone isn't reliable — especially on Safari/iOS — so this
 * also checks `persisted()` and returns the real result rather than
 * assuming success. Callers are responsible for surfacing a UI nudge when
 * this comes back false (that nudge itself is scheduled for M5's polish
 * pass, not this slice).
 */
export async function ensurePersistentStorage(): Promise<boolean> {
  if (!('storage' in navigator) || !('persist' in navigator.storage)) {
    return false;
  }
  const alreadyPersisted = await navigator.storage.persisted();
  if (alreadyPersisted) return true;
  return navigator.storage.persist();
}
