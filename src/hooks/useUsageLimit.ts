// Server-authoritative usage limit. Client state is a UX cache only.
const STORAGE_KEY = "careertoolkit_usage";
const DAILY_LIMIT = 5;

interface UsageCache {
  date: string;
  remaining: number;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCache(): UsageCache {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: UsageCache = JSON.parse(raw);
      if (data.date === getToday()) return data;
    }
  } catch {}
  return { date: getToday(), remaining: DAILY_LIMIT };
}

/** Update local cache with server-reported remaining count */
export function syncRemaining(remaining: number): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getToday(), remaining }));
}

export function getRemainingGenerations(): number {
  return Math.max(0, getCache().remaining);
}

export function canGenerate(): boolean {
  return getRemainingGenerations() > 0;
}

/** @deprecated Client-side only — kept for optimistic UI update before server response */
export function recordGeneration(): void {
  const cache = getCache();
  cache.remaining = Math.max(0, cache.remaining - 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export const DAILY_GENERATION_LIMIT = DAILY_LIMIT;
