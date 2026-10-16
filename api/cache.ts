type Entry = { at: number; value: unknown };

const store = new Map<string, Entry>();
const TTL_MS = 15_000;

export async function cachedRead<T>(
  userId: string,
  key: string,
  load: () => Promise<T>,
): Promise<T> {
  const fullKey = `${userId}:${key}`;
  const hit = store.get(fullKey);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return hit.value as T;
  }
  const value = await load();
  store.set(fullKey, { at: Date.now(), value });
  return value;
}

export function invalidateUserReads(userId: string): void {
  const prefix = `${userId}:`;
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
