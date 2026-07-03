// Tiny in-memory TTL cache with single-flight, for deterministic read requests
// (weather, per-destination AI content). Session-scoped: it lives for the life
// of the JS runtime and clears on app restart, so results never go badly stale.
//
// Use `cached(key, ttlMs, fn)` to wrap an async fetch — concurrent callers for
// the same key share one in-flight request, and the resolved value is reused
// until it expires.

const store = new Map(); // key -> { value, expiresAt }
const inflight = new Map(); // key -> Promise

export async function cached(key, ttlMs, fn) {
  const entry = store.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.value;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = (async () => {
    const value = await fn();
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

export function clearMemoryCache() {
  store.clear();
  inflight.clear();
}

export const TTL = {
  MIN_5: 5 * 60 * 1000,
  MIN_30: 30 * 60 * 1000,
  HOUR_1: 60 * 60 * 1000,
};
